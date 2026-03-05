import { useEffect, useState } from 'react'
import styles from './Conversation.module.css';
import { Conversation } from '@chatscope/chat-ui-kit-react'
import { instanceAxs } from '../../../lib/axios';
import type { ChatRoom, Message } from '../../../types/chat';

interface LoggedUser {
  _id: string;
  username?: string;
  profilePicture?: string;
}

interface FriendData {
  _id: string;
  username?: string;
  profilePicture?: string;
}

interface ProductData {
  _id: string;
  title?: string;
  location?: string;
  price?: number;
  annonceImages?: Array<{ location: string }>;
}

interface ConversationsProps {
  productId: string;
  conversation: ChatRoom;
  loggedUser: LoggedUser | null;
  isActive: boolean;
  findFriend: (buyer: string, seller: string, loggedUser: LoggedUser | null) => string | null;
}

const Conversations = ({ productId, conversation, loggedUser, isActive, findFriend }: ConversationsProps) => {

    const [friend, setFriend] = useState<FriendData | null>(null)
    const [lastMessage, setLastMessage] = useState<Message | null>(null);
    const [product, setProduct] = useState<ProductData | null>(null);
    const [unreadCount, setUnreadCount] = useState<number>(0);

    useEffect(() => {
        const friendId = findFriend(conversation.buyer, conversation.seller, loggedUser);
        if(!friendId) return;
        const fetchUser = () => {
            instanceAxs.get(`/fetchuser?userId=${friendId}`).then(response => {
                let fetchedUser = response.data.user;
                setFriend(fetchedUser);
                setLastMessage(
                conversation.messages?.length > 0
                    ? conversation.messages[conversation.messages.length - 1]
                    : null
                );
            })
            .catch(() => {})
        }
        fetchUser();
    }, [conversation, loggedUser])

    useEffect(() => {
        const fetchProduct = async () => {
            if(!productId) return;
            await instanceAxs.get(`/product?id=${productId}`).then(response => {
                setProduct(response.data.product)
            })
            .catch(() => {})
        }
        fetchProduct();
    }, [productId])

    useEffect(() => {
        const getUnreadMsg = async() => {
            if(!conversation || !conversation.unreadMessages || conversation.messages.length === 0) return;
            let last_msg = conversation.messages[conversation.messages.length - 1]
            if(last_msg.sender !== loggedUser?._id) {
                setUnreadCount(conversation.unreadMessages ?? 0)
            }
        }
        getUnreadMsg()
    }, [conversation])

  return (
            <Conversation className={styles['conversation-div']}
                name={friend?.username}
                lastSenderName={lastMessage?.sender === loggedUser?._id ? 'Du' : friend?.username}
                info={lastMessage?.msg}
                active={isActive}
                lastActivityTime={conversation.lastActivity}
                unreadCnt={unreadCount}
            >
                <span>
                    {friend?.profilePicture ? (
                        <img className={styles['conversation-avatar']} src={friend?.profilePicture} alt={friend?.username} />
                    ) : (
                        <div className={styles['conversation-avatar-placeholder']}>
                        {friend?.username?.charAt(0)?.toUpperCase()}
                        </div>
                    )}
                </span>
                <div className={styles['conversation-operations']}>
                        <div className={styles['conversation-operations-info']}>
                            <p className="conversation-product-name" style={{fontSize: '14px'}}>{product?.title}</p>
                            <p>{product?.location}</p>
                            <p>{product?.price}</p>
                        </div>
                        <img className={styles['conversation-product-img']} src={product?.annonceImages?.[0]?.location}/>
                </div>
            </Conversation>
  )
}

export default Conversations;
