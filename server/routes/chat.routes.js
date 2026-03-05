const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const ensureAuth = require('../middleware/ensureAuth');

router.post('/new/room', ensureAuth, chatController.createRoom);
router.post('/new/message', ensureAuth, chatController.newMessage);
router.post('/get/rooms', ensureAuth, chatController.getRooms);
router.get('/get/room', ensureAuth, chatController.getRoomByCredentials);
router.post('/resetunread', ensureAuth, chatController.resetUnread);

module.exports = router;
