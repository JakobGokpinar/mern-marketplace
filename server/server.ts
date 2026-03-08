// Must be first import — sets NODE_ENV before other modules evaluate
import './config/env';

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import MongoStore from 'connect-mongo';
import { Server } from 'socket.io';
import http from 'http';
import mongoose from 'mongoose';
import connectToDatabase from './config/db';
import UserModel from './models/User';
import logger from './config/logger';
import validateEnv from './config/validateEnv';

// Initialize passport strategies (must be before routes that use passport)
import './config/passport';

// Module imports
import authRouter from './modules/auth/auth.routes';
import userRouter from './modules/user/user.routes';
import listingRouter from './modules/listing/listing.routes';
import chatRouter from './modules/chat/chat.routes';

const ObjectId = mongoose.Types.ObjectId;

validateEnv();
const isProduction = process.env.NODE_ENV === 'production';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const PORT = process.env.PORT || 3080;

const allowedOrigins = [
  'http://localhost:3000',
  'https://rego.jakobg.tech',
  clientUrl,
];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const mongoUrl = process.env.MONGODB_URL!;
connectToDatabase(mongoUrl);

app.use(helmet());
app.use(cookieParser());
app.set('trust proxy', 1);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
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
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
    rolling: true,
    proxy: true,
    store: MongoStore.create({
      mongoUrl: mongoUrl,
    }),
    cookie: {
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 24 * 14,
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// CSRF protection
import { doubleCsrfProtection, generateToken } from './middleware/csrf';

// Routes
app.get('/', (_req, res) => res.send('Rego API is running'));
app.get('/api/csrf-token', (req, res) => {
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

// Mount modules
api.use('/', authRouter);
api.use('/', userRouter);
api.use('/', listingRouter);
api.use('/', chatRouter);

app.use('/api', api);

// Socket.io
interface ConnectedUser {
  userId: string;
  socketId: string;
}

interface SendMessagePayload {
  msg: string;
  sentAt: string;
  sender: string;
  receiver: string;
}

interface TypingPayload {
  typer: string;
  receiver: string;
}

let connectedUsers: ConnectedUser[] = [];

const addUser = (userId: string, socketId: string) => {
  if (!connectedUsers.some(user => user.userId === userId)) {
    connectedUsers.push({ userId, socketId });
  }
};
const removeUser = (socketId: string) => {
  connectedUsers = connectedUsers.filter(user => user.socketId !== socketId);
};
const findUser = (userId: string) => {
  return connectedUsers.find(user => user.userId === userId);
};

io.on('connection', (socket) => {
  socket.on('addUser', (userId: string) => {
    addUser(userId, socket.id);
    io.emit('getUsers', connectedUsers);
  });

  socket.on('sendMessage', ({ msg, sentAt, sender, receiver }: SendMessagePayload) => {
    const friend = findUser(receiver);
    if (!friend) return;
    io.to(friend.socketId).emit('getMessage', { sender, msg, sentAt });
  });

  socket.on('userTyping', ({ typer, receiver }: TypingPayload) => {
    const friend = findUser(receiver);
    if (!friend) return;
    io.to(friend.socketId).emit('getTyping', { typer, receiver });
  });

  socket.on('stoppedTyping', ({ typer, receiver }: TypingPayload) => {
    const friend = findUser(receiver);
    if (!friend) return;
    io.to(friend.socketId).emit('getStoppedTyping', { typer, receiver });
  });

  socket.on('messagesRead', ({ roomId, receiver }: { roomId: string; receiver: string }) => {
    const friend = findUser(receiver);
    if (!friend) return;
    io.to(friend.socketId).emit('getMessagesRead', { roomId });
  });

  socket.on('logout', async () => {
    const user = connectedUsers.find(u => u.socketId === socket.id);
    removeUser(socket.id);
    if (!user) return;
    try {
      await UserModel.updateOne({ _id: new ObjectId(user.userId) }, { $set: { lastActiveAt: Date.now() } });
    } catch (err) {
      logger.error('Socket logout — failed to update lastActiveAt: %s', err);
    }
  });

  socket.on('disconnect', async () => {
    const user = connectedUsers.find(u => u.socketId === socket.id);
    if (!user) return;
    removeUser(socket.id);
    io.emit('getUsers', connectedUsers);
    try {
      await UserModel.updateOne({ _id: new ObjectId(user.userId) }, { $set: { lastActiveAt: Date.now() } });
    } catch (err) {
      logger.error('Socket disconnect — failed to update lastActiveAt: %s', err);
    }
  });
});

app.use((err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

server.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));

export default app;
