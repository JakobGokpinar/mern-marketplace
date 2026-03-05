const express = require("express");
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const MongoDbStore = require('connect-mongo').default;
const { Server } = require('socket.io'); 
const http = require('http');
const connectToDatabase = require('./config/db.js');
const UserModel = require('./models/UserModel.js')
const ObjectId = require('mongoose').Types.ObjectId
const logger = require('./config/logger');
require('dotenv').config();
const validateEnv = require('./config/validateEnv');

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
    process.env.NODE_ENV = "development"
    process.env.CLIENT_URL = process.env.CLIENT_URL_DEV
    process.env.MONGO_URL = process.env.MONGO_URL_DEV
} else if (process.argv.includes('start')) {
    process.env.NODE_ENV = "production"
    process.env.CLIENT_URL = process.env.CLIENT_URL_PROD
    process.env.MONGO_URL = process.env.MONGO_URL_PROD
}

validateEnv();
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

app.use(helmet());
app.enable('trust proxy');

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'For mange forsøk. Prøv igjen om 15 minutter.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/login', authLimiter);
app.use('/api/signup', authLimiter);

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

// CSRF protection
const { doubleCsrfProtection, generateToken } = require('./middleware/csrf');

// Routes
app.get("/", (req, res) => res.send("Rego API is running"));
app.get("/api/csrf-token", (req, res) => {
    const token = generateToken(req, res);
    res.json({ csrfToken: token });
});

const api = express.Router();
// CSRF protection on all state-changing requests (POST, PUT, PATCH, DELETE)
api.use((req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
    }
    doubleCsrfProtection(req, res, next);
});
api.use('/', authRouter);
api.use('/fetchuser', userRouter);
api.use('/newannonce', annonceRouter);
api.use('/search', searchRouter);
api.use('/product', findProductRouter);
api.use('/favorites', favoritesRouter);
api.use('/profile', profileRouter);
api.use('/chat', chatRouter);
api.use('/email', emailRouter);

app.use('/api', api);

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
    logger.error(err);
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error'
    });
});

server.listen(PORT, "0.0.0.0", () => logger.info(`Server is running on port ${PORT}`));

module.exports = app;
