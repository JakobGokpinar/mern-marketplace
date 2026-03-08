import { useRef, useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Chat.module.css';

import { useAppSelector } from '../../store/hooks';
import { useChat } from '../../hooks/useChat';
import Conversations from './parts/Conversations';
import Messages from './parts/Messages';
import type { Message } from '../../types/chat';
import type { ChatRoom } from '../../types/chat';
import Icon from '../../components/icons/Icon';

const groupMessagesBySender = (messages: Message[]): Message[][] =>
  messages.reduce<Message[][]>((groups, msg) => {
    const last = groups[groups.length - 1];
    if (last?.[0]?.sender === msg.sender) last.push(msg);
    else groups.push([msg]);
    return groups;
  }, []);

interface LoggedUser {
  _id: string;
  fullName?: string;
  profilePicture?: string;
}

const Chat = () => {
  const user = useAppSelector(state => state.user.user);
  const messageListRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const {
    conversations,
    currentChat,
    setCurrentChat,
    messagesArray,
    hasMoreMessages,
    isLoadingMore,
    loadOlderMessages,
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

  const loggedUser = user ? (user as LoggedUser) : null;

  const findFriendWrapper = (buyer: string, seller: string, lu: LoggedUser | null) =>
    lu ? findFriendId(buyer, seller, lu._id) : null;

  const groupedMessages = groupMessagesBySender(messagesArray ?? []);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [messageInput]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messagesArray]);

  const handleSelectConversation = useCallback((conv: ChatRoom) => {
    setCurrentChat(conv);
    setMobilePanelOpen(true);
  }, [setCurrentChat]);

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
      <div className={`${styles['sidebar']} ${!mobilePanelOpen ? styles['sidebar--visible'] : ''}`}>
        <div className={styles['sidebar-header']}>Meldinger</div>
        <div className={styles['sidebar-list']}>
          {conversations.length === 0 ? (
            <div className={styles['sidebar-empty']}>
              <Icon name="comments" />
              <p>Ingen meldinger</p>
              <span>Start en samtale fra en annonse</span>
            </div>
          ) : conversations.map((conv, i) => (
            <div key={conv._id ?? i} onClick={() => handleSelectConversation(conv)}>
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
      <div className={`${styles['panel']} ${!mobilePanelOpen ? styles['panel--hidden'] : ''}`}>
        {!currentChat ? (
          <div className={styles['empty-state']}>
            <Icon name="message" />
            <p>Velg en samtale</p>
            <span>Velg en samtale</span>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className={styles['header']}>
              <button
                className={styles['header-back']}
                onClick={() => setMobilePanelOpen(false)}
                aria-label="Tilbake"
              >
                <Icon name="arrow-left" />
              </button>
              {friend?.profilePicture ? (
                <img src={friend.profilePicture} alt={friend.fullName} className={styles['header-avatar']} />
              ) : (
                <div className={styles['header-avatar-placeholder']}>
                  {friend?.fullName?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
              )}
              <div className={styles['header-info']}>
                <div className={styles['header-name']}>{friend?.fullName}</div>
                {currentFriendStatus && (
                  <div className={styles['header-status']}>Sist aktiv {currentFriendStatus}</div>
                )}
              </div>
              {currentProduct && (
                <Link
                  to={`/l/${currentProduct._id}`}
                  target="_blank"
                  className={styles['header-product']}
                >
                  <span className={styles['header-product-title']}>{currentProduct.title}</span>
                  {currentProduct.images?.[0]?.location && (
                    <img
                      src={currentProduct.images[0].location}
                      alt={currentProduct.title}
                      className={styles['header-product-img']}
                    />
                  )}
                </Link>
              )}
            </div>

            {/* Messages */}
            <div className={styles['message-list']} ref={messageListRef}>
              {hasMoreMessages && (
                <button
                  className={styles['load-older']}
                  onClick={loadOlderMessages}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? 'Laster...' : 'Last inn eldre meldinger'}
                </button>
              )}
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
                  {friend?.fullName} skriver
                </div>
              )}
            </div>

            {/* Input */}
            <div className={styles['input-area']}>
              <textarea
                ref={textareaRef}
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
                <Icon name="paper-plane" size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
