import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL;

// Using named export as requested
export const socket = io(URL, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000
});
