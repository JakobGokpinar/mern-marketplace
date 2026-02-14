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

var authRouter = require('./auth');
var userRouter = require('./fetchUser.js');
var annonceRouter = require('./createAnnonce.js');
var searchRouter = require('./search.js')
var findProductRouter = require('./findProduct.js');
var searchProductRouter = require('./searchProduct.js');
var addFavoritesRouter = require('./addfavorites.js');
var profileSettingsRouter = require('./profileSettings.js');
var chatRouter = require('./chat.js');
var emailRouter = require('./emailRoute.js')

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
const client_link = process.env.CLIENT_URL

const app = express();
var server = http.createServer(app); 
const io = new Server(server, { 
    cors: {
        origin: ['http://localhost:3000', 'https://www.rego.live']
    }
})

const mongoUrl = process.env.MONGO_URL;

// Connecting to database
connectToDatabase(mongoUrl);

app.use(express.json({limit: '50mb'}))  // setting limit to 50mb in order to save 'image encoded data' to server when uploading a new annonce

app.use(express.urlencoded({ extended: false, limit: '50mb'})); //setting limit for the same reason

app.use(cors({origin: ['http://localhost:3000', 'https://www.rego.live'], credentials: true}));
app.enable('trust proxy')

app.use(
    session({
        name: 'signin-cookie',
        secret: "secret key",
        resave: false,
        saveUninitialized: true,
        proxy: true,
        store: MongoDbStore.create({
            mongoUrl: mongoUrl
        }),
        cookie: {
            sameSite: 'lax',
            secure: isProduction,
            maxAge: 1000 * 60 * 60 * 24 * 30  //1 ay. milisaniye x saniye x dakika x saat
        }
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => res.send("Server Side Works!"));
app.use('/', authRouter)
app.use('/fetchuser', userRouter)
app.use('/newannonce', annonceRouter)
app.use('/search', searchRouter)
app.use('/product', findProductRouter)
app.use('/searchproduct', searchProductRouter)
app.use('/favorites', addFavoritesRouter);
app.use('/profile', profileSettingsRouter);
app.use('/chat', chatRouter);
app.use('/email', emailRouter)

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
    //when connect
    socket.on('addUser', (userId) => {  
        addUser(userId, socket.id)
        io.emit('getUsers', connectedUsers)
    })

    //send message
    socket.on('sendMessage', ({ msg, sentAt, sender, receiver }) => {
        let friend = findUser(receiver);
        if(!friend) return;
        io.to(friend.socketId).emit('getMessage', {
            sender,
            msg,
            sentAt
        })
    })

    //on typing
    socket.on('userTyping', ({ typer, receiver }) => {
        let friend = findUser(receiver);
        if(!friend) return;
        io.to(friend.socketId).emit('getTyping', {
            typer, receiver
        })
    })

    socket.on('stoppedTyping', ({ typer, receiver }) => {
        let friend = findUser(receiver);
        if(!friend) return;
        io.to(friend.socketId).emit('getStoppedTyping', {
            typer, receiver
        })
    })
    //when logging out
    socket.on('logout', async () => {
        let user = connectedUsers.find(user => user.socketId === socket.id)
        removeUser(socket.id)
        if(!user) return;
        await UserModel.updateOne({ _id: ObjectId(user.userId) }, { $set: { lastActiveAt: Date.now() }})
    })

    //when disconnect
    socket.on('disconnect', async () => {
        let user = connectedUsers.find(user => user.socketId === socket.id)
        if(!user) return;
        removeUser(socket.id)
        io.emit('getUsers', connectedUsers)
        await UserModel.updateOne({ _id: ObjectId(user.userId) }, { $set: { lastActiveAt: Date.now() }})
    })
})

server.listen(3080, "0.0.0.0", () => console.log(`Server is running...`));

module.exports = app;
