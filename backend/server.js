const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const MonitorService = require('./services/monitorService');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all origins for this demo
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Services
const monitorService = new MonitorService(io);

// Routes
app.use('/api', apiRoutes(monitorService));

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send initial history on connect
    socket.emit('initial_data', monitorService.getHistory());

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
