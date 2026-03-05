const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const ensureAuth = require('../middleware/ensureAuth');
const validate = require('../middleware/validate');
const { createRoom, getRoomByCredentials, newMessage, resetUnread } = require('../schemas/chat.schema');

router.post('/new/room', ensureAuth, validate(createRoom), chatController.createRoom);
router.post('/new/message', ensureAuth, validate(newMessage), chatController.newMessage);
router.post('/get/rooms', ensureAuth, chatController.getRooms);
router.get('/get/room', ensureAuth, validate(getRoomByCredentials, 'query'), chatController.getRoomByCredentials);
router.post('/resetunread', ensureAuth, validate(resetUnread), chatController.resetUnread);

module.exports = router;
