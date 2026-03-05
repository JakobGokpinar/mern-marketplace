import styles from './Chat.module.css';
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import Conversations from "./ChatParts/Conversations";
import Messages from "./ChatParts/Messages";
import {
  MainContainer,
  ChatContainer,
  MessageSeparator,
  MessageList,
  MessageInput,
  ConversationHeader,
  Sidebar,
  Avatar,
  ConversationList,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { useChat } from "../../hooks/useChat";
import type { Message } from "../../types/chat";

const groupMessagesBySender = (messages: Message[]): Message[][] =>
  messages.reduce<Message[][]>((groups, msg) => {
    const last = groups[groups.length - 1];
    if (last?.[0]?.sender === msg.sender) {
      last.push(msg);
    } else {
      groups.push([msg]);
    }
    return groups;
  }, []);

interface LoggedUser {
  _id: string;
  username?: string;
  profilePicture?: string;
}

const Chat = () => {
  const user = useAppSelector(state => state.user.user);

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
    findFriendId,
  } = useChat();

  const findFriendWrapper = (buyer: string, seller: string, loggedUser: LoggedUser | null): string | null => {
    return loggedUser ? findFriendId(buyer, seller, loggedUser._id) : null;
  };

  const groupedMessages = groupMessagesBySender(messagesArray ?? []);

  return (
    <div className={styles['chat-div-container']}>
      <MainContainer responsive>
        <Sidebar className={styles['chat-sidebar']} position="left">
          <ConversationList>
            {conversations?.map((conv, index) => (
              <div key={index} onClick={() => setCurrentChat(conv)}>
                <Conversations
                  productId={conv.productId}
                  conversation={conv}
                  loggedUser={'_id' in user ? user as LoggedUser : null}
                  isActive={conv._id === currentChat?._id}
                  findFriend={findFriendWrapper}
                />
              </div>
            ))}
          </ConversationList>
        </Sidebar>

        {!currentChat ? (
          <ChatContainer>
            <MessageList>
              <MessageList.Content
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  height: "100%",
                  textAlign: "center",
                  fontSize: "1.2em",
                }}>
                Vennligst velg en chat
              </MessageList.Content>
            </MessageList>
          </ChatContainer>
        ) : (
          <ChatContainer>
            <ConversationHeader>
              <ConversationHeader.Back />
              <Avatar src={friend?.profilePicture} name={friend?.username} size="lg" />
              <ConversationHeader.Content
                className="mx-4"
                userName={friend?.username}
                info={currentFriendStatus}
              />
              <ConversationHeader.Actions className={styles['conversationHeader-product']}>
                <p style={{ margin: '0px 15px' }}>{currentProduct?.title}</p>
                <Link to={`/produkt/${currentProduct?._id}`} target="_blank">
                  <img
                    className={styles['conversationHeader-product-img']}
                    src={currentProduct?.annonceImages?.[0]?.location}
                    alt={currentProduct?.title}
                  />
                </Link>
              </ConversationHeader.Actions>
            </ConversationHeader>
            <MessageList typingIndicator={isFriendTyping ? <TypingIndicator content={`${friend?.username} skriver`} /> : ''}>
              <MessageSeparator>{new Date(messagesArray?.[0]?.sentAt).toDateString()}</MessageSeparator>
              {groupedMessages.map((group, index) => (
                <div key={index}>
                  <Messages
                    messageArr={group}
                    sender={group[0].sender}
                    direction={group[0].sender === user._id ? 'outgoing' : 'incoming'}
                  />
                </div>
              ))}
            </MessageList>
            <MessageInput
              placeholder='Skriv en melding her...'
              onSend={sendMessage}
              value={messageInput}
              onChange={e => setMessageInput(e)}
            />
          </ChatContainer>
        )}
      </MainContainer>
    </div>
  );
};

export default Chat;
