const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

router.post('/new/room', chatController.createRoom);
router.post('/new/message', chatController.newMessage);
router.post('/get/rooms', chatController.getRooms);
router.get('/get/room', chatController.getRoomByCredentials);
router.post('/resetunread', chatController.resetUnread);

module.exports = router;