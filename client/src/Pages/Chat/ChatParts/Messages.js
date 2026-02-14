import React from 'react'
import { MessageGroup, Message } from '@chatscope/chat-ui-kit-react'
import { format } from 'timeago.js';

const Messages = ({ messageArr, sender, direction}) => {
  return (
    <MessageGroup direction={direction} sender={sender?.username} sentTime={format(messageArr[0]?.sentAt)}>
           <MessageGroup.Messages>
              {messageArr?.map((msg, index) => {
                  return(
                    <Message 
                        key={index}
                        model={{ message: msg.msg}}
                    />
                  )
              })}
          </MessageGroup.Messages>
          <MessageGroup.Footer>{format(messageArr[messageArr.length - 1]?.sentAt)}</MessageGroup.Footer>
    </MessageGroup>
  )
}

export default Messages;
