import express from 'express';
import * as chatController from './chat.controller';
import ensureAuth from '../../middleware/ensureAuth';
import validate from '../../middleware/validate';
import { createRoom, getRoomByCredentials, getMessages, newMessage, resetUnread } from './chat.schema';

const router = express.Router();

router.post('/chat/new/room', ensureAuth, validate(createRoom), chatController.createRoom);
router.post('/chat/new/message', ensureAuth, validate(newMessage), chatController.newMessage);
router.post('/chat/get/rooms', ensureAuth, chatController.getRooms);
router.get('/chat/get/room', ensureAuth, validate(getRoomByCredentials, 'query'), chatController.getRoomByCredentials);
router.get('/chat/get/messages', ensureAuth, validate(getMessages, 'query'), chatController.getMessages);
router.post('/chat/resetunread', ensureAuth, validate(resetUnread), chatController.resetUnread);

export default router;
