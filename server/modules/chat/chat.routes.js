const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');
const ensureAuth = require('../../middleware/ensureAuth');
const validate = require('../../middleware/validate');
const { createRoom, getRoomByCredentials, getMessages, newMessage, resetUnread } = require('./chat.schema');

router.post('/chat/new/room', ensureAuth, validate(createRoom), chatController.createRoom);
router.post('/chat/new/message', ensureAuth, validate(newMessage), chatController.newMessage);
router.post('/chat/get/rooms', ensureAuth, chatController.getRooms);
router.get('/chat/get/room', ensureAuth, validate(getRoomByCredentials, 'query'), chatController.getRoomByCredentials);
router.get('/chat/get/messages', ensureAuth, validate(getMessages, 'query'), chatController.getMessages);
router.post('/chat/resetunread', ensureAuth, validate(resetUnread), chatController.resetUnread);

module.exports = router;
