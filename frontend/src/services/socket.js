import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL;

if (!URL) {
    console.error("CRITICAL ERROR: VITE_API_URL is missing in environment variables. Connection will fail.");
}

const socket = io(URL);

export default socket;
