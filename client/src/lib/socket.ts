import { io } from 'socket.io-client';

const serverURL = import.meta.env.VITE_API_URL || 'http://localhost:3080';

const socket = io(serverURL, { autoConnect: false });

export default socket;
