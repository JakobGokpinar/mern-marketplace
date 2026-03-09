import { io } from 'socket.io-client';

const socketURL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3080';

const socket = io(socketURL, { autoConnect: false });

export default socket;
