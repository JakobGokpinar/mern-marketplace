import styles from './Messages.module.css';
import { timeago } from '../../../utils/timeago';

interface ChatMessage {
  _id?: string;
  sender: string;
  msg: string;
  sentAt: string | Date;
  readAt?: string | Date | null;
}

interface MessagesProps {
  messageArr: ChatMessage[];
  direction: 'incoming' | 'outgoing';
}

const Messages = ({ messageArr, direction }: MessagesProps) => {
  const lastMsg = messageArr[messageArr.length - 1];
  const isRead = !!lastMsg?.readAt;

  return (
    <div className={`${styles['group']} ${styles[`group--${direction}`]}`}>
      {messageArr.map((msg, i) => (
        <div key={msg._id ?? i} className={styles['bubble']}>{msg.msg}</div>
      ))}
      <span className={styles['timestamp']}>
        {timeago(lastMsg?.sentAt)}
        {direction === 'outgoing' && (
          <span className={`${styles['read-receipt']} ${isRead ? styles['read-receipt--read'] : ''}`}>
            {isRead ? '✓✓' : '✓'}
          </span>
        )}
      </span>
    </div>
  );
};

export default Messages;
