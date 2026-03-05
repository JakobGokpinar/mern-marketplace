import styles from './Messages.module.css';
import { timeago } from '../../../utils/timeago';

interface ChatMessage {
  _id?: string;
  sender: string;
  msg: string;
  sentAt: string | Date;
}

interface MessagesProps {
  messageArr: ChatMessage[];
  direction: 'incoming' | 'outgoing';
}

const Messages = ({ messageArr, direction }: MessagesProps) => (
  <div className={`${styles['group']} ${styles[`group--${direction}`]}`}>
    {messageArr.map((msg, i) => (
      <div key={msg._id ?? i} className={styles['bubble']}>{msg.msg}</div>
    ))}
    <span className={styles['timestamp']}>
      {timeago(messageArr[messageArr.length - 1]?.sentAt)}
    </span>
  </div>
);

export default Messages;
