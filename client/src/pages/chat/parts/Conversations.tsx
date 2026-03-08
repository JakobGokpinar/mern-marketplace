import { useEffect, useState } from 'react';
import styles from './Conversation.module.css';
import { instanceAxs } from '../../../lib/axios';
import type { ChatRoom } from '../../../types/chat';

interface LoggedUser {
  _id: string;
  fullName?: string;
  profilePicture?: string;
}

interface FriendData {
  _id: string;
  fullName?: string;
  profilePicture?: string;
}

interface ProductData {
  title?: string;
  images?: Array<{ location: string }>;
}

interface ConversationsProps {
  productId: string;
  conversation: ChatRoom;
  loggedUser: LoggedUser | null;
  isActive: boolean;
  findFriend: (buyer: string, seller: string, loggedUser: LoggedUser | null) => string | null;
}

const Conversations = ({ productId, conversation, loggedUser, isActive, findFriend }: ConversationsProps) => {
  const [friend, setFriend] = useState<FriendData | null>(null);
  const [product, setProduct] = useState<ProductData | null>(null);

  useEffect(() => {
    const friendId = findFriend(conversation.buyer, conversation.seller, loggedUser);
    if (!friendId) return;
    instanceAxs.get(`/users/${friendId}`)
      .then(r => setFriend(r.data.user))
      .catch(() => { /* friend may have been deleted */ });
  }, [conversation, loggedUser]);

  useEffect(() => {
    if (!productId) return;
    instanceAxs.get(`/listings/${productId}`)
      .then(r => setProduct(r.data.product))
      .catch(() => { /* listing may have been deleted */ });
  }, [productId]);

  const isBuyer = loggedUser?._id === conversation.buyer;
  const unreadCount = isBuyer ? conversation.unreadBuyer : conversation.unreadSeller;

  return (
    <div className={`${styles['item']} ${isActive ? styles['item--active'] : ''}`}>
      {friend?.profilePicture ? (
        <img src={friend.profilePicture} alt={friend.fullName} className={styles['avatar']} />
      ) : (
        <div className={styles['avatar-placeholder']}>
          {friend?.fullName?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
      )}

      <div className={styles['body']}>
        <div className={styles['name']}>{friend?.fullName ?? '...'}</div>
        {product?.title && (
          <div className={styles['product-title']}>{product.title}</div>
        )}
      </div>

      <div className={styles['meta']}>
        {product?.images?.[0]?.location && (
          <img
            src={product.images[0].location}
            alt={product.title}
            className={styles['product-img']}
          />
        )}
        {unreadCount > 0 && (
          <span className={styles['unread-badge']}>{unreadCount}</span>
        )}
      </div>
    </div>
  );
};

export default Conversations;
