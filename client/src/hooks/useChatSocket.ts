import { useState, useEffect } from 'react';
import socket from '../lib/socket';
import type { Message } from '../types/chat';

interface UseChatSocketOptions {
  friendId: string | undefined;
  userId: string;
  messageInput: string;
}

export const useChatSocket = ({ friendId, userId, messageInput }: UseChatSocketOptions) => {
  const [arrivalMessage, setArrivalMessage] = useState<Message | null>(null);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const [readReceiptEvent, setReadReceiptEvent] = useState<{ roomId: string; at: number } | null>(null);

  // Incoming message
  useEffect(() => {
    const handler = ({ sender, msg, sentAt }: Message) => {
      setArrivalMessage({ sender, msg, sentAt });
      setIsFriendTyping(false);
    };
    socket.on('getMessage', handler);
    return () => { socket.off('getMessage', handler); };
  }, []);

  // Read receipts
  useEffect(() => {
    const handler = ({ roomId }: { roomId: string }) => {
      setReadReceiptEvent({ roomId, at: Date.now() });
    };
    socket.on('getMessagesRead', handler);
    return () => { socket.off('getMessagesRead', handler); };
  }, []);

  // Typing indicators
  useEffect(() => {
    const handleTyping = (data: { typer: string }) => {
      if (data.typer === friendId) setIsFriendTyping(true);
    };
    const handleStopTyping = (data: { typer: string }) => {
      if (data.typer === friendId) setIsFriendTyping(false);
    };
    socket.on('getTyping', handleTyping);
    socket.on('getStoppedTyping', handleStopTyping);
    return () => {
      socket.off('getTyping', handleTyping);
      socket.off('getStoppedTyping', handleStopTyping);
    };
  }, [friendId]);

  // Emit typing status
  useEffect(() => {
    if (!friendId || !userId) return;
    if (messageInput !== '') {
      socket.emit('userTyping', { typer: userId, receiver: friendId });
    } else {
      socket.emit('stoppedTyping', { typer: userId, receiver: friendId });
    }
  }, [messageInput, friendId, userId]);

  const emitSendMessage = (msg: string, sentAt: Date, sender: string, receiver: string) => {
    socket.emit('sendMessage', { msg, sentAt, sender, receiver });
  };

  const emitMessagesRead = (roomId: string, receiver: string) => {
    socket.emit('messagesRead', { roomId, receiver });
  };

  return { arrivalMessage, isFriendTyping, emitSendMessage, readReceiptEvent, emitMessagesRead };
};
