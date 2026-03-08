import { instanceAxs } from '../lib/axios';
import type { ChatRoom, Message } from '../types/chat';

export const getChatRoomsApi = async (): Promise<ChatRoom[]> => {
  const res = await instanceAxs.get<ChatRoom[]>('/chat/rooms');
  return res.data;
};

export const getChatRoomApi = async (buyer: string, seller: string, productId: string): Promise<ChatRoom | null> => {
  const res = await instanceAxs.get<ChatRoom | null>('/chat/rooms/find', {
    params: { buyer, seller, productId },
  });
  return res.data;
};

export const createChatRoomApi = async (buyer: string, seller: string, productId: string): Promise<ChatRoom> => {
  const res = await instanceAxs.post<{ response: ChatRoom }>('/chat/rooms', {
    buyer,
    seller,
    product_id: productId,
  });
  return res.data.response;
};

export const sendMessageApi = async (sender: string, msg: string, roomId: string): Promise<Message> => {
  const res = await instanceAxs.post<Message>('/chat/messages', { sender, msg, roomId });
  return res.data;
};

export const getMessagesApi = async (roomId: string, before?: string): Promise<{ messages: Message[]; hasMore: boolean }> => {
  const params: Record<string, string> = { roomId };
  if (before) params.before = before;
  const res = await instanceAxs.get<{ messages: Message[]; hasMore: boolean }>('/chat/messages', { params });
  return res.data;
};

export const resetUnreadApi = async (roomId: string): Promise<void> => {
  await instanceAxs.put('/chat/rooms/read', { roomId });
};
