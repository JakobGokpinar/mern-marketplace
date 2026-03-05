const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const ConversationModel = require('../../models/ConversationModel');

const MESSAGES_PER_PAGE = 50;

const createRoom = async (req, res) => {
    // Buyer must be the authenticated user — prevent creating rooms on behalf of others
    if (req.body.buyer !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    let conversation = ConversationModel({
        seller: new ObjectId(req.body.seller),
        buyer: new ObjectId(req.body.buyer),
        productId: new ObjectId(req.body.product_id)
    });
    try {
        const response = await conversation.save();
        return res.status(200).json({ message: 'Room created', response });
    } catch (error) {
        return res.status(500).json({ message: 'Could not create room' });
    }
};

const getRooms = async (req, res) => {
    // Use authenticated user's ID — never trust the client to send the right user ID
    const userId = req.user._id;
    try {
        // Return rooms without messages (messages fetched separately via getMessages)
        const response = await ConversationModel.find({
            $or: [
                { buyer: new ObjectId(userId) },
                { seller: new ObjectId(userId) }
            ]
        }).select('-messages').lean();
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ message: 'Could not fetch rooms' });
    }
};

const getMessages = async (req, res) => {
    const roomId = req.query.roomId;
    const before = req.query.before; // ISO date string for cursor-based pagination
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || MESSAGES_PER_PAGE));

    try {
        const room = await ConversationModel.findById(new ObjectId(roomId)).select('messages buyer seller').lean();
        if (!room) return res.status(404).json({ message: 'Room not found' });

        const userId = req.user._id.toString();
        if (room.buyer.toString() !== userId && room.seller.toString() !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        let messages = room.messages || [];
        if (before) {
            const beforeDate = new Date(before);
            messages = messages.filter(m => new Date(m.sentAt) < beforeDate);
        }

        const totalCount = messages.length;
        const sliced = messages.slice(-limit);
        const hasMore = totalCount > limit;

        return res.status(200).json({ messages: sliced, hasMore });
    } catch (error) {
        return res.status(500).json({ message: 'Could not fetch messages' });
    }
};

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
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ message: 'Could not fetch room' });
    }
};

const newMessage = async (req, res) => {
    const roomId = new ObjectId(req.body.roomId);

    // Verify caller is a member of this room before allowing them to post
    const room = await ConversationModel.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    const userId = req.user._id.toString();
    if (room.buyer.toString() !== userId && room.seller.toString() !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    // Sender is always the authenticated user — never trust req.body.sender
    const message = {
        sender: req.user._id,
        msg: req.body.msg,
        sentAt: Date.now()
    };
    try {
        await ConversationModel.updateOne({ _id: roomId }, {
            $push: { messages: message },
            $inc: { unreadMessages: 1 }
        });
        return res.status(200).json({ message: 'Message sent' });
    } catch (error) {
        return res.status(500).json({ message: 'Error occured while sending the message' });
    }
};

const resetUnread = async (req, res) => {
    const roomId = req.body.roomId;

    // Verify caller is a member of this room
    const room = await ConversationModel.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    const userId = req.user._id.toString();
    if (room.buyer.toString() !== userId && room.seller.toString() !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        await ConversationModel.updateOne({ _id: roomId }, {
            $set: { unreadMessages: 0 }
        });
        res.status(200).json({ message: 'Unread messages reset' });
    } catch (error) {
        return res.status(500).json({ message: 'Error occured' });
    }
};

module.exports = { createRoom, getRooms, getRoomByCredentials, getMessages, newMessage, resetUnread };
