import io from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL || 'https://iot-backend-248u.onrender.com';
const socket = io(URL, {
    transports: ['websocket', 'polling']
});

export default socket;
