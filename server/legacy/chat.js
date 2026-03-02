const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const express = require('express');
const ConversationModel = require('./models/ConversationModel.js');

//new room
const createRoom = async (req, res) => {
    let conversation =  ConversationModel({
        seller: new new ObjectId(req.body.seller), 
        buyer: new new ObjectId(req.body.buyer),
        productId: new new ObjectId(req.body.product_id)
    });
    try {
        const response = await conversation.save()
        return res.status(200).json({message: 'Room created', response})
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error })
    }
}

//get room
const getRooms = async (req, res) => {
    const user = req.body.user
    try {
        let response = await ConversationModel.find({
            $or: [
                { buyer: new ObjectId(user) },
                { seller: new ObjectId(user) }
            ]        
        })
        return res.status(200).json(response)
    } catch (error) {
        console.error(error)
        return res.status(500).json(error)
    }
}

//get room with buyer, seller and productId
const getRoomByCredentials = async (req, res) => {
    let buyer = req.query.buyer;
    let seller = req.query.seller;
    let productId = req.query.productId;  
    try {
        const response = await ConversationModel.find({ 
            seller: new ObjectId(seller),
            buyer: new ObjectId(buyer),
            productId: new ObjectId(productId)
         });
        return res.status(200).json(response)
    } catch (error) {
        console.error(error)
        return res.status(500).json(error)
    }
}

//add message
const newMessage = async (req, res) => {
    const roomId = new ObjectId(req.body.roomId);
    const newMessage = {
        sender: new ObjectId(req.body.sender),
        msg: req.body.msg,
        sentAt: Date.now()
    };
    try {
        await ConversationModel.updateOne({ _id: roomId}, {
            $push: { messages: newMessage },
            $inc: { unreadMessages: 1 }
        })
        return res.status(200).json({ message: 'Message sent' })       
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error occured while sending the message', error})
    }
}

const resetUnread = async (req, res) => {
    const roomId = req.body.roomId;
    try {
        await ConversationModel.updateOne({ _id: roomId}, {
            $set: { unreadMessages: 0 }
        })
        res.status(200).json({ message: 'Unread messages resetted' })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error occured while sending the message', error})
    }
}

const router = express.Router();

router.post('/new/room', createRoom);
router.post('/new/message', newMessage)
router.post('/get/rooms', getRooms);
router.get('/get/room', getRoomByCredentials);
router.post('/resetunread', resetUnread)

module.exports = router;