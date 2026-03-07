import express from 'express';
import * as chatController from './chat.controller';
import ensureAuth from '../../middleware/ensureAuth';
import validate from '../../middleware/validate';
import { createRoom, getRoomByCredentials, getMessages, newMessage, resetUnread } from './chat.schema';

const router = express.Router();

router.post('/chat/rooms', ensureAuth, validate(createRoom), chatController.createRoom);
router.get('/chat/rooms', ensureAuth, chatController.getRooms);
router.get('/chat/rooms/find', ensureAuth, validate(getRoomByCredentials, 'query'), chatController.getRoomByCredentials);
router.get('/chat/messages', ensureAuth, validate(getMessages, 'query'), chatController.getMessages);
router.post('/chat/messages', ensureAuth, validate(newMessage), chatController.newMessage);
router.put('/chat/rooms/read', ensureAuth, validate(resetUnread), chatController.resetUnread);

export default router;
