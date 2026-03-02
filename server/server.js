const express = require("express");
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const MongoDbStore = require('connect-mongo');
const { Server } = require('socket.io'); 
const http = require('http');
const connectToDatabase = require('./config/db.js');
const UserModel = require('./models/UserModel.js')
const ObjectId = require('mongoose').Types.ObjectId
require('dotenv').config();

// Initialize passport strategies (must be before routes that use passport)
require('./config/passport');

// Route imports
const authRouter = require('./routes/auth.routes');
const userRouter = require('./routes/user.routes');
const annonceRouter = require('./routes/annonce.routes');
const searchRouter = require('./routes/search.routes');
const findProductRouter = require('./routes/product.routes');
const favoritesRouter = require('./routes/favorites.routes');
const profileRouter = require('./routes/profile.routes');
const chatRouter = require('./routes/chat.routes');
const emailRouter = require('./routes/email.routes');

// Determine environment
if (process.argv.includes('dev')) {
    console.log("Development server is started")
    process.env.NODE_ENV = "development"
    process.env.CLIENT_URL = process.env.CLIENT_URL_DEV
    process.env.MONGO_URL = process.env.MONGO_URL_DEV
} else if (process.argv.includes('start')) {
    console.log("Production server is started")
    process.env.NODE_ENV = "production"
    process.env.CLIENT_URL = process.env.CLIENT_URL_PROD
    process.env.MONGO_URL = process.env.MONGO_URL_PROD
}

const isProduction = process.env.NODE_ENV === 'production';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const PORT = process.env.PORT || 3080;

// Allowed origins for CORS
const allowedOrigins = [
    'http://localhost:3000',
    'https://rego.jakobg.tech',
    clientUrl
];

const app = express();
var server = http.createServer(app); 
const io = new Server(server, { 
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
})

const mongoUrl = process.env.MONGO_URL;
connectToDatabase(mongoUrl);

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: false, limit: '50mb'}));

app.use(cors({
    origin: allowedOrigins, 
    credentials: true
}));
app.enable('trust proxy');

app.use(
    session({
        name: 'signin-cookie',
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        rolling: true,
        proxy: true,
        store: MongoDbStore.create({
            mongoUrl: mongoUrl
        }),
        cookie: {
            sameSite: isProduction ? 'none' : 'lax',
            secure: isProduction,
            maxAge: 1000 * 60 * 60 * 24 * 14
        }
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req, res) => res.send("Rego API is running"));
app.use('/', authRouter);                // POST /login, /signup, DELETE /logout
app.use('/fetchuser', userRouter);       // GET /fetchuser, /fetchuser/find, /fetchuser/find/seller
app.use('/newannonce', annonceRouter);   // POST /newannonce/imageupload, /create, /update, /delete, /remove/annonceimages
app.use('/search', searchRouter);        // GET /search, /search/mine, POST /search
app.use('/searchproduct', searchRouter); // POST /searchproduct (frontend compatibility)
app.use('/product', findProductRouter);  // GET /product?id=
app.use('/favorites', favoritesRouter);  // POST /favorites/add, /remove, GET /favorites/get
app.use('/profile', profileRouter);      // POST /profile/upload/picture, /update/userinfo, /delete/picture, /delete/account, GET /profile/get/picture
app.use('/chat', chatRouter);            // POST /chat/new/room, /new/message, /get/rooms, /resetunread, GET /chat/get/room
app.use('/email', emailRouter);          // POST /email/verify, /newverificationemail

// Socket.io
let connectedUsers = [];

const addUser = (userId, socketId) => {
    !connectedUsers.some(user => user.userId === userId) &&
        connectedUsers.push({ userId, socketId })
}
const removeUser = (socketId) => {
    connectedUsers = connectedUsers.filter(user => user.socketId !== socketId)
}
const findUser = (userId) => {
    return connectedUsers.find(user => user.userId === userId)
}

io.on('connection', (socket) => {
    socket.on('addUser', (userId) => {  
        addUser(userId, socket.id)
        io.emit('getUsers', connectedUsers)
    })

    socket.on('sendMessage', ({ msg, sentAt, sender, receiver }) => {
        let friend = findUser(receiver);
        if(!friend) return;
        io.to(friend.socketId).emit('getMessage', { sender, msg, sentAt })
    })

    socket.on('userTyping', ({ typer, receiver }) => {
        let friend = findUser(receiver);
        if(!friend) return;
        io.to(friend.socketId).emit('getTyping', { typer, receiver })
    })

    socket.on('stoppedTyping', ({ typer, receiver }) => {
        let friend = findUser(receiver);
        if(!friend) return;
        io.to(friend.socketId).emit('getStoppedTyping', { typer, receiver })
    })

    socket.on('logout', async () => {
        let user = connectedUsers.find(user => user.socketId === socket.id)
        removeUser(socket.id)
        if(!user) return;
        await UserModel.updateOne({ _id: new ObjectId(user.userId) }, { $set: { lastActiveAt: Date.now() }})
    })

    socket.on('disconnect', async () => {
        let user = connectedUsers.find(user => user.socketId === socket.id)
        if(!user) return;
        removeUser(socket.id)
        io.emit('getUsers', connectedUsers)
        await UserModel.updateOne({ _id: new ObjectId(user.userId) }, { $set: { lastActiveAt: Date.now() }})
    })
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ 
      message: err.message || 'Internal server error'
    });
});

server.listen(PORT, "0.0.0.0", () => console.log(`Server is running on port ${PORT}`));

module.exports = app;
