import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { timeago } from '../utils/timeago';
import socket from '../lib/socket';
import {
  getChatRoomsApi,
  getChatRoomApi,
  createChatRoomApi,
  sendMessageApi,
  resetUnreadApi,
} from '../services/chatService';
import { fetchUserByIdApi } from '../services/authService';
import { fetchProductApi } from '../services/productService';
import { queryKeys } from '../lib/queryKeys';
import toast from 'react-hot-toast';
import { useAppSelector } from '../store/hooks';
import type { ChatRoom, Message } from '../types/chat';
import type { User } from '../types/user';
import type { Product } from '../types/product';

const findFriendId = (buyer: string, seller: string, userId: string): string | null => {
  if (userId === buyer) return seller;
  if (userId === seller) return buyer;
  return null;
};

export const useChat = () => {
  const location = useLocation();
  const user = useAppSelector((state) => state.user.user) as User | Record<string, never>;
  const userId = '_id' in user ? user._id : '';

  const [currentChat, setCurrentChat] = useState<ChatRoom | null>(null);
  const [messagesArray, setMessagesArray] = useState<Message[]>([]);
  const [friend, setFriend] = useState<User | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentFriendStatus, setCurrentFriendStatus] = useState<string | null>(null);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [arrivalMessage, setArrivalMessage] = useState<Message | null>(null);

  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: queryKeys.chat.rooms(userId),
    queryFn: () => getChatRoomsApi(userId),
    enabled: !!userId,
  });

  // Open chat from navigation state (e.g. from ProductPage)
  useEffect(() => {
    const buyer = location.state?.buyer as string | undefined;
    const seller = location.state?.seller as string | undefined;
    const product_id = location.state?.product_id as string | undefined;
    if (!buyer || !seller || !product_id) return;

    const openOrCreateRoom = async () => {
      try {
        const existing = await getChatRoomApi(buyer, seller, product_id);
        if (existing && Array.isArray(existing) && (existing as ChatRoom[]).length > 0) {
          setCurrentChat((existing as ChatRoom[])[0]);
        } else {
          const newRoom = await createChatRoomApi(buyer, seller, product_id);
          setCurrentChat(newRoom);
          void refetchConversations();
        }
      } catch {
        toast.error('Kunne ikke åpne chat');
      }
    };
    void openOrCreateRoom();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // Load friend + messages when chat changes
  useEffect(() => {
    if (!currentChat || !userId) return;
    const friendId = findFriendId(currentChat.buyer, currentChat.seller, userId);
    if (!friendId) return;

    const loadFriend = async () => {
      try {
        const friendData = await fetchUserByIdApi(friendId);
        setFriend(friendData);
        setMessagesArray(currentChat.messages);
        setCurrentFriendStatus(
          (friendData as User & { lastActiveAt?: string }).lastActiveAt
            ? timeago((friendData as User & { lastActiveAt?: string }).lastActiveAt!)
            : null
        );
        await resetUnreadApi(currentChat._id);
      } catch {
        // ignore
      }
    };
    void loadFriend();
  }, [currentChat, userId]);

  // Load product for current chat
  useEffect(() => {
    if (!currentChat?.productId) return;
    fetchProductApi(currentChat.productId)
      .then(setCurrentProduct)
      .catch(() => {});
  }, [currentChat]);

  // Socket — incoming message
  useEffect(() => {
    const handler = ({ sender, msg, sentAt }: Message) => {
      setArrivalMessage({ sender, msg, sentAt });
      setIsFriendTyping(false);
    };
    socket.on('getMessage', handler);
    return () => { socket.off('getMessage', handler); };
  }, []);

  // Apply arrival message
  useEffect(() => {
    if (!arrivalMessage || arrivalMessage.sender !== friend?._id) return;
    setMessagesArray((prev) => [...prev, arrivalMessage]);
    if (currentChat?._id) void resetUnreadApi(currentChat._id);
  }, [arrivalMessage, friend, currentChat]);

  // Socket — typing indicators
  useEffect(() => {
    const handleTyping = (data: { typer: string }) => {
      if (data.typer === friend?._id) setIsFriendTyping(true);
    };
    const handleStopTyping = (data: { typer: string }) => {
      if (data.typer === friend?._id) setIsFriendTyping(false);
    };
    socket.on('getTyping', handleTyping);
    socket.on('getStoppedTyping', handleStopTyping);
    return () => {
      socket.off('getTyping', handleTyping);
      socket.off('getStoppedTyping', handleStopTyping);
    };
  }, [friend]);

  // Emit typing status
  useEffect(() => {
    if (!friend?._id || !userId) return;
    if (messageInput !== '') {
      socket.emit('userTyping', { typer: userId, receiver: friend._id });
    } else {
      socket.emit('stoppedTyping', { typer: userId, receiver: friend._id });
    }
  }, [messageInput, friend, userId]);

  const sendMutation = useMutation({
    mutationFn: () => sendMessageApi(userId, messageInput, currentChat!._id),
    onSuccess: () => {
      setMessagesArray((prev) => [...prev, { sender: userId, msg: messageInput, sentAt: new Date() }]);
      socket.emit('sendMessage', {
        msg: messageInput,
        sentAt: new Date(),
        sender: userId,
        receiver: friend!._id,
      });
      setMessageInput('');
    },
    onError: () => {
      toast.error('Feil mens sender en melding');
    },
  });

  const sendMessage = useCallback(() => {
    if (!messageInput.trim() || !currentChat || !friend) return;
    sendMutation.mutate();
  }, [messageInput, currentChat, friend, sendMutation]);

  return {
    conversations,
    currentChat,
    setCurrentChat,
    messagesArray,
    friend,
    currentProduct,
    currentFriendStatus,
    isFriendTyping,
    messageInput,
    setMessageInput,
    sendMessage,
    isSending: sendMutation.isPending,
    findFriendId,
  };
};
