import React, { useEffect, useState } from 'react'
import './Conversation.css';
import { Conversation } from '@chatscope/chat-ui-kit-react'
import { instanceAxs } from '../../../config/api.js';

const Conversations = ({ productId, conversation, loggedUser, isActive, findFriend }) => {

    const [friend, setFriend] = useState(null) 
    const [lastMessage, setLastMessage] = useState(null);
    const [product, setProduct] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

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
            .catch(err => {
                console.error(err)
            })
        }
        fetchUser();
    }, [conversation, loggedUser])

    useEffect(() => {
        const fetchProduct = async () => {
            if(!productId) return;
            await instanceAxs.get(`/product?id=${productId}`).then(response => {
                setProduct(response.data.product)
            })
            .catch(err => {
                console.error(err)
            })
        }
        fetchProduct();
    }, [productId])

    useEffect(() => {
        const getUnreadMsg = async() => {
            if(!conversation || conversation.unreadMessages === 0 || conversation.messages.length === 0) return;
            let last_msg = conversation.messages[conversation.messages.length - 1]
            if(last_msg.sender !== loggedUser?._id) {
                setUnreadCount(conversation.unreadMessages)
            }
        }
        getUnreadMsg()
    }, [conversation])

  return (
            <Conversation className='conversation-div'
                name={friend?.username}
                lastSenderName={lastMessage?.sender === loggedUser?._id ? 'Du' : friend?.username}
                info={lastMessage?.msg}
                active={isActive}
                lastActivityTime={conversation.lastActivity}
                unreadCnt={unreadCount}
            >
                <span as='Avatar'>
                    {friend?.profilePicture ? (
                        <img className='conversation-avatar' src={friend?.profilePicture} alt={friend?.username} />
                    ) : (
                        <div className='conversation-avatar-placeholder'>
                        {friend?.username?.charAt(0)?.toUpperCase()}
                        </div>
                    )}
                </span>
                <div className='conversation-operations' as={Conversation.Operations}>
                        <div className='conversation-operations-info'>
                            <p className='conversation-product-name' style={{fontSize: '14px'}}>{product?.title}</p>
                            <p>{product?.location}</p>
                            <p>{product?.price}</p>
                        </div>
                        <img className='conversation-product-img' src={product?.annonceImages?.[0]?.location}/>
                </div>
            </Conversation>
  )
}

export default Conversations;
