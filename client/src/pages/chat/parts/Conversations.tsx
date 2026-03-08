import styles from './Conversation.module.css';
import type { ChatRoom } from '../../../types/chat';

interface ConversationsProps {
  conversation: ChatRoom;
  userId: string;
  isActive: boolean;
}

const Conversations = ({ conversation, userId, isActive }: ConversationsProps) => {
  const isBuyer = userId === conversation.buyer;
  const unreadCount = isBuyer ? conversation.unreadBuyer : conversation.unreadSeller;

  return (
    <div className={`${styles['item']} ${isActive ? styles['item--active'] : ''}`}>
      {conversation.friendPicture ? (
        <img src={conversation.friendPicture} alt={conversation.friendName ?? ''} className={styles['avatar']} />
      ) : (
        <div className={styles['avatar-placeholder']}>
          {conversation.friendName?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
      )}

      <div className={styles['body']}>
        <div className={styles['name']}>{conversation.friendName ?? '...'}</div>
        {conversation.listingTitle && (
          <div className={styles['product-title']}>{conversation.listingTitle}</div>
        )}
      </div>

      <div className={styles['meta']}>
        {conversation.listingImage && (
          <img
            src={conversation.listingImage}
            alt={conversation.listingTitle ?? ''}
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
