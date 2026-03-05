export interface Message {
  _id?: string;
  sender: string;
  msg: string;
  sentAt: string | Date;
}

export interface ChatRoom {
  _id: string;
  buyer: string;
  seller: string;
  productId: string;
  messages: Message[];
  unreadCount?: number;
  unreadMessages?: number;
  lastActivity?: string;
}
