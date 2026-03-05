import { useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from './Chat.module.css';

import { useAppSelector } from '../../store/hooks';
import { useChat } from '../../hooks/useChat';
import Conversations from './ChatParts/Conversations';
import Messages from './ChatParts/Messages';
import type { Message } from '../../types/chat';

const groupMessagesBySender = (messages: Message[]): Message[][] =>
  messages.reduce<Message[][]>((groups, msg) => {
    const last = groups[groups.length - 1];
    if (last?.[0]?.sender === msg.sender) last.push(msg);
    else groups.push([msg]);
    return groups;
  }, []);

interface LoggedUser {
  _id: string;
  username?: string;
  profilePicture?: string;
}

const Chat = () => {
  const user = useAppSelector(state => state.user.user);
  const messageListRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    currentChat,
    setCurrentChat,
    messagesArray,
    friend,
    currentProduct,
    currentFriendStatus,
    isFriendTyping,
    messageInput,
    setMessageInput,
    sendMessage,
    isSending,
    findFriendId,
  } = useChat();

  const loggedUser = '_id' in user ? (user as LoggedUser) : null;

  const findFriendWrapper = (buyer: string, seller: string, lu: LoggedUser | null) =>
    lu ? findFriendId(buyer, seller, lu._id) : null;

  const groupedMessages = groupMessagesBySender(messagesArray ?? []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messagesArray]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const firstMsgDate = messagesArray?.[0]?.sentAt
    ? new Date(messagesArray[0].sentAt).toLocaleDateString('no-NO', { dateStyle: 'long' })
    : null;

  return (
    <div className={styles['container']}>
      {/* Sidebar */}
      <div className={styles['sidebar']}>
        <div className={styles['sidebar-header']}>Meldinger</div>
        <div className={styles['sidebar-list']}>
          {conversations.map((conv, i) => (
            <div key={conv._id ?? i} onClick={() => setCurrentChat(conv)}>
              <Conversations
                productId={conv.productId}
                conversation={conv}
                loggedUser={loggedUser}
                isActive={conv._id === currentChat?._id}
                findFriend={findFriendWrapper}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main panel */}
      <div className={styles['panel']}>
        {!currentChat ? (
          <div className={styles['empty-state']}>Velg en samtale</div>
        ) : (
          <>
            {/* Header */}
            <div className={styles['header']}>
              {friend?.profilePicture ? (
                <img src={friend.profilePicture} alt={friend.username} className={styles['header-avatar']} />
              ) : (
                <div className={styles['header-avatar-placeholder']}>
                  {friend?.username?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
              )}
              <div className={styles['header-info']}>
                <div className={styles['header-name']}>{friend?.username}</div>
                {currentFriendStatus && (
                  <div className={styles['header-status']}>Sist aktiv {currentFriendStatus}</div>
                )}
              </div>
              {currentProduct && (
                <Link
                  to={`/produkt/${currentProduct._id}`}
                  target="_blank"
                  className={styles['header-product']}
                >
                  <span className={styles['header-product-title']}>{currentProduct.title}</span>
                  {currentProduct.annonceImages?.[0]?.location && (
                    <img
                      src={currentProduct.annonceImages[0].location}
                      alt={currentProduct.title}
                      className={styles['header-product-img']}
                    />
                  )}
                </Link>
              )}
            </div>

            {/* Messages */}
            <div className={styles['message-list']} ref={messageListRef}>
              {firstMsgDate && (
                <div className={styles['date-separator']}>{firstMsgDate}</div>
              )}
              {groupedMessages.map((group, i) => (
                <Messages
                  key={i}
                  messageArr={group}
                  direction={group[0].sender === loggedUser?._id ? 'outgoing' : 'incoming'}
                />
              ))}
              {isFriendTyping && (
                <div className={styles['typing-indicator']}>
                  <div className={styles['typing-dots']}>
                    <span /><span /><span />
                  </div>
                  {friend?.username} skriver
                </div>
              )}
            </div>

            {/* Input */}
            <div className={styles['input-area']}>
              <textarea
                className={styles['input-textarea']}
                placeholder="Skriv en melding... (Enter for å sende)"
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className={styles['send-btn']}
                onClick={sendMessage}
                disabled={!messageInput.trim() || isSending}
                aria-label="Send melding"
              >
                <i className="fa-solid fa-paper-plane" style={{ fontSize: 14 }} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
