import React, { useEffect, useState } from "react";
import './Chat.css';
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { Button, Modal, Spinner } from 'react-bootstrap';
import { format } from "timeago.js";
import { instanceAxs } from "../../config/api.js";
import socket from '../../config/socket.js'
import Conversations from "./ChatParts/Conversations.js";
import Messages from "./ChatParts/Messages";
import { MainContainer, ChatContainer, MessageSeparator,
  MessageList,
  MessageInput,
  ConversationHeader,
  Sidebar,
  Avatar,
  ConversationList,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

import { useDispatch, useSelector } from "react-redux";
import { uiSliceActions } from "../../features/uiSlice";
import { Link, useLocation } from "react-router-dom";

const Chat = () => {

  const user = useSelector(state => state.user.user);
  const loggedIn = useSelector(state => state.user.isLoggedIn);
  const dispatch = useDispatch();
  const location = useLocation();

  const [messageInputValue, setMessageInputValue] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [friend, setFriend] = useState(null);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const [currentChat, setCurrentChat] = useState(null);
  const [productId, setProductId] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [conversations, setConversations] = useState(null);
  const [messagesArray, setMessagesArray] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState(null);
  const [currentFriendStatus, setCurrentFriendStatus] = useState(null);

  var currentSender = '';
  var senderMessages = [];

    useEffect(() => {
      socket.on('getMessage', ({ sender, msg, sentAt }) => {
        setArrivalMessage({ sender, msg, sentAt })
        setIsFriendTyping(false);
      })
      socket.on('getUsers', data => {
        setConnectedUsers(data)
      })
    }, [])

    useEffect(() => {
      const fetchConversations = () => {
        if(Object.keys(user).length === 0) return
        instanceAxs.post('/chat/get/rooms', { user: user._id }).then(response => {
          setConversations(response.data)
        })
        .catch(error => {
          console.log(error)
        })
      }
      fetchConversations();
    }, [user])

    useEffect(() => {
      const fetchConversation = async() => {
        let buyer = location?.state?.buyer;
        let seller = location?.state?.seller;
        let product_id = location?.state?.product_id;
        if(!buyer || !seller || !product_id) return;
          try {
            let response = await instanceAxs.get(`/chat/get/room?buyer=${buyer}&seller=${seller}&productId=${product_id}`)
            if(response.status !== 200) return;
            if(response.data.length > 0) {
              setCurrentChat(response.data[0])
            } else {
              response = await instanceAxs.post('/chat/new/room', { buyer, seller, product_id });
              if(response.status !== 200) return;
              setCurrentChat(response.data.response)
              setConversations(prev => [...prev, response.data.response])
            }
          } catch (error) {
            console.log(error)
          }
      }
      fetchConversation();
    }, [location])

    useEffect(() => {
      socket.on('getTyping', data => {
        if(data.typer === friend?._id) {
          setIsFriendTyping(true)
        }
      })
      socket.on('getStoppedTyping', data => {
        if(data.typer === friend?._id) {
          setIsFriendTyping(false)
        }
      })
    }, [friend])

    useEffect(() => {
      if(!arrivalMessage || arrivalMessage === '' || arrivalMessage.sender !== friend?._id) return;
      setMessagesArray(prev => [...prev, arrivalMessage])  
      instanceAxs.post('/chat/resetunread', {roomId: currentChat?._id})
      .then(response => {
        console.log(response)
      })
      .catch(error => {
        console.log(error)
      })
    }, [arrivalMessage, friend])

    useEffect(() => {
      if(Object.keys(user).length === 0) return;
      socket.emit('addUser', user._id)
    }, [user])

    useEffect(() => {
      const fetchFriend = () => {
        const friend = findFriend(currentChat?.buyer, currentChat?.seller, user);
        if (friend) {
          instanceAxs.get(`/fetchuser?userId=${friend}`).then(response => {
            let responseFriend = response.data.user;
            setFriend(responseFriend);
            setMessagesArray(currentChat?.messages);
            setProductId(currentChat?.productId)
            let connectedFriend = connectedUsers?.find(user => user?.userId === responseFriend?._id)
            if(connectedFriend) {
              setCurrentFriendStatus('Active now')
            } else {
              setCurrentFriendStatus(format(responseFriend?.lastActiveAt))
            }
            instanceAxs.post('/chat/resetunread', {roomId: currentChat?._id})
            .catch(error => {
              console.log(error)
            })
          })
          .catch(error => {
            console.log(error)
          })
        }
      }
      fetchFriend();
    }, [currentChat])

    useEffect(() => {
        const fetchProduct = () => {
            if(!productId) return;
            instanceAxs.get(`/product?id=${productId}`).then(response => {
                setCurrentProduct(response.data.product)
            })
            .catch(err => {
                console.log(err)
            })
        }
        fetchProduct();
    }, [productId])

    useEffect(() => {
      if(messageInputValue !== "") {
        socket.emit('userTyping', { typer: user?._id, receiver: friend?._id});
      } else {
        socket.emit('stoppedTyping', { typer: user?._id, receiver: friend?._id})
      }
    }, [messageInputValue]);

    useEffect(() => {
      // if(!connectedUsers || !currentChat || !friend) return;

    }, [currentChat])

    function sendMessage() {
      instanceAxs.post('/chat/new/message', 
        {sender: user._id, msg: messageInputValue, roomId: currentChat?._id})
        .then(response => {
          console.log(response)
            if(response.status !== 200) {
              dispatch(uiSliceActions.setFeedbackBanner({ severity: 'error', msg: 'Feil mens sender en melding'}))
              return;
            } else {
              setMessagesArray(prev => [...prev, {sender: user._id, msg: messageInputValue, sentAt: new Date()}])
            }
        })
        .catch(err => {
            console.log(err)
        })

      socket.emit('sendMessage', {
        msg: messageInputValue, 
        sentAt: new Date(), 
        sender: user._id, 
        receiver: friend._id
      });
      setMessageInputValue('')
    }

    const findFriend = (buyer, seller, loggedUser) => {
      if(loggedUser._id === buyer) {
        return seller
      } else if (loggedUser._id === seller) {
        return buyer;
      } else {
        return null
      }
    }

  return (
      <div className="chat-div-container">
          {!loggedIn ?
                <Modal show={true}>
                    <Modal.Header>
                        <Modal.Title>Du må logge inn</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Prøv å logge inn for å se meldingene dine</p>
                        <a href="/login">
                            <Button variant="danger">Logg inn</Button>
                        </a>
                    </Modal.Body>
                </Modal>
            :     
              <MainContainer responsive>
                  <Sidebar className="chat-sidebar" position="left">
                      <ConversationList>
                        {conversations?.map((conv, index) => {
                          return(
                            <div as='Conversation' key={index} onClick={() => setCurrentChat(conv)}>
                                <Conversations 
                                    productId={conv.productId}
                                    conversation={conv} 
                                    loggedUser={user} 
                                    isActive={conv._id === currentChat?._id}
                                    findFriend={findFriend}/>
                            </div>
                          ) 
                        })}
                      </ConversationList>
                  </Sidebar>

                  {!currentChat ? 
                      <ChatContainer>
                          <MessageList>
                            <MessageList.Content 
                              style={{
                                display: "flex",
                                "flexDirection": "column",
                                "justifyContent": "center",
                                height: "100%",
                                textAlign: "center",
                                fontSize: "1.2em"
                              }}>            
                              Vennligst velg en chat
                            </MessageList.Content>
                          </MessageList>
                      </ChatContainer>

                      :
                      <ChatContainer>
                          <ConversationHeader>
                              <ConversationHeader.Back />
                              <Avatar src={friend?.profilePicture} name={friend?.username} size="lg"/>
                              <ConversationHeader.Content className="mx-4" style={{color: 'green'}}
                                userName={friend?.username}
                                info={currentFriendStatus === 'Active now' ? <><Spinner animation="grow" variant="success" size="sm"/> Active Now</> : currentFriendStatus}
                              />
                              <ConversationHeader.Actions className="conversationHeader-product">
                                  <p  style={{ margin: '0px 15px'}}>{currentProduct?.title}</p>
                                  <Link to={`/produkt/${currentProduct?._id}`} target="_blank">
                                      <img className='conversationHeader-product-img' 
                                          src={currentProduct?.annonceImages?.[0]?.location}
                                        />
                                  </Link>
                              </ConversationHeader.Actions>
                          </ConversationHeader>
                        <MessageList typingIndicator={isFriendTyping ? <TypingIndicator content={`${friend?.username} skriver`}/> : ''}>                                                  
                              <MessageSeparator>{new Date(messagesArray?.[0]?.sentAt).toDateString()}</MessageSeparator>
                              {messagesArray?.map((item, index) => {
                                if(item.sender !== currentSender) {
                                    if(index === 0) {                                   
                                      currentSender = item.sender;
                                      senderMessages.push(item)
                                    } else {
                                      let copyArr = senderMessages;
                                      senderMessages = [];
                                      senderMessages.push(item);
                                      currentSender = item.sender;
                                      return( 
                                        <div as='MessageGroup' key={index}>
                                          <Messages 
                                            messageArr={copyArr} 
                                            sender={currentSender} 
                                            direction={currentSender !== user._id ? 'outgoing' : 'incoming'}
                                          />
                                        </div>
                                      )
                                    }
                                } else {
                                  senderMessages.push(item)
                                }
                              })}                          
                              <div as='MessageGroup'>
                                <Messages 
                                  messageArr={senderMessages} 
                                  sender={currentSender} 
                                  direction={currentSender === user?._id ? 'outgoing' : 'incoming'}
                                />
                              </div>
                        </MessageList>
                        <MessageInput 
                            placeholder='Skriv en melding her...'
                            onSend={sendMessage} 
                            value={messageInputValue} 
                            onChange={e => setMessageInputValue(e)}
                            ></MessageInput>   
                      </ChatContainer>
                      }
              </MainContainer>
        }
      </div>
  );
};

export default Chat;
