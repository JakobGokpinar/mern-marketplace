import { MessageGroup, Message } from '@chatscope/chat-ui-kit-react'
import { format } from 'timeago.js';

interface ChatMessage {
  _id?: string;
  sender: string;
  msg: string;
  sentAt: string | Date;
}

interface MessagesProps {
  messageArr: ChatMessage[];
  sender: string;
  direction: 'incoming' | 'outgoing';
}

const Messages = ({ messageArr, sender, direction }: MessagesProps) => {
  return (
    <MessageGroup direction={direction} sender={sender} sentTime={format(messageArr[0]?.sentAt)}>
           <MessageGroup.Messages>
              {messageArr?.map((msg, index) => {
                  return(
                    <Message
                        key={index}
                        model={{ message: msg.msg, direction: direction, position: 'normal' }}
                    />
                  )
              })}
          </MessageGroup.Messages>
          <MessageGroup.Footer>{format(messageArr[messageArr.length - 1]?.sentAt)}</MessageGroup.Footer>
    </MessageGroup>
  )
}

export default Messages;
