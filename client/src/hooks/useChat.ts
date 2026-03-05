import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { timeago } from '../utils/timeago';
import {
  getChatRoomsApi,
  getChatRoomApi,
  createChatRoomApi,
  getMessagesApi,
  sendMessageApi,
  resetUnreadApi,
} from '../services/chatService';
import { fetchUserByIdApi } from '../services/authService';
import { fetchProductApi } from '../services/productService';
import { queryKeys } from '../lib/queryKeys';
import toast from 'react-hot-toast';
import { useAppSelector } from '../store/hooks';
import { useChatSocket } from './useChatSocket';
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
  const user = useAppSelector((state) => state.user.user);
  const userId = user?._id ?? '';

  const [currentChat, setCurrentChat] = useState<ChatRoom | null>(null);
  const [messagesArray, setMessagesArray] = useState<Message[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [friend, setFriend] = useState<User | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentFriendStatus, setCurrentFriendStatus] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');

  const { arrivalMessage, isFriendTyping, emitSendMessage } = useChatSocket({
    friendId: friend?._id,
    userId,
    messageInput,
  });

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

    const loadChatData = async () => {
      try {
        const [friendData, messageData] = await Promise.all([
          fetchUserByIdApi(friendId),
          getMessagesApi(currentChat._id),
        ]);
        setFriend(friendData);
        setMessagesArray(messageData.messages);
        setHasMoreMessages(messageData.hasMore);
        setCurrentFriendStatus(
          (friendData as User & { lastActiveAt?: string }).lastActiveAt
            ? timeago((friendData as User & { lastActiveAt?: string }).lastActiveAt!)
            : null
        );
        await resetUnreadApi(currentChat._id);
      } catch {
        toast.error('Kunne ikke laste chat');
      }
    };
    void loadChatData();
  }, [currentChat, userId]);

  // Load product for current chat
  useEffect(() => {
    if (!currentChat?.productId) return;
    fetchProductApi(currentChat.productId)
      .then(setCurrentProduct)
      .catch(() => { toast.error('Kunne ikke laste produkt'); });
  }, [currentChat]);

  // Apply arrival message
  useEffect(() => {
    if (!arrivalMessage || arrivalMessage.sender !== friend?._id) return;
    setMessagesArray((prev) => [...prev, arrivalMessage]);
    if (currentChat?._id) void resetUnreadApi(currentChat._id);
  }, [arrivalMessage, friend, currentChat]);

  const loadOlderMessages = useCallback(async () => {
    if (!currentChat || !hasMoreMessages || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const oldest = messagesArray[0];
      const before = oldest?.sentAt ? new Date(oldest.sentAt).toISOString() : undefined;
      const data = await getMessagesApi(currentChat._id, before);
      setMessagesArray(prev => [...data.messages, ...prev]);
      setHasMoreMessages(data.hasMore);
    } catch {
      toast.error('Kunne ikke laste eldre meldinger');
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentChat, hasMoreMessages, isLoadingMore, messagesArray]);

  const sendMutation = useMutation({
    mutationFn: () => sendMessageApi(userId, messageInput, currentChat!._id),
    onSuccess: () => {
      setMessagesArray((prev) => [...prev, { sender: userId, msg: messageInput, sentAt: new Date() }]);
      emitSendMessage(messageInput, new Date(), userId, friend!._id);
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
    hasMoreMessages,
    isLoadingMore,
    loadOlderMessages,
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
