export interface Message {
  _id?: string;
  sender: string;
  msg: string;
  sentAt: string | Date;
  readAt?: string | Date | null;
}

export interface ChatRoom {
  _id: string;
  buyer: string;
  seller: string;
  productId: string;
  unreadBuyer: number;
  unreadSeller: number;
  roomCreatedAt?: string;
}
