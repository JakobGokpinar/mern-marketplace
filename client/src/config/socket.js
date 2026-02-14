import { io } from "socket.io-client";

const serverURL = process.env.REACT_APP_API_URL || "http://localhost:3080";
const socket = io(serverURL);

export default socket;
