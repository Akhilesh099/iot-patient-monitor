const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// --------------------
// STATE
// --------------------
let lastDataTime = Date.now();
let disconnectedEmitted = false;

// --------------------
// ROOT (optional, avoids confusion)
// --------------------
app.get("/", (req, res) => {
    res.send("IoT Patient Backend is running");
});

// --------------------
// HEALTH CHECK
// --------------------
app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

// --------------------
// MAIN DATA ENDPOINT
// --------------------
app.post("/api/data", (req, res) => {
    // 1. LOG TIMESTAMP (Debug Latency)
    console.log("POST RECEIVED @", Date.now(), req.body);

    const { heart_rate, spo2 } = req.body;

    if (!heart_rate || !spo2) {
        return res.status(400).json({ error: "Invalid data" });
    }

    lastDataTime = Date.now();
    disconnectedEmitted = false;

    // 2. IMMEDIATE EMIT (Zero Delay)
    io.emit("vitals", {
        heart_rate,
        spo2,
        timestamp: new Date().toISOString()
    });

    res.status(200).json({ success: true });
});

// --------------------
// DISCONNECT WATCHDOG
// --------------------
setInterval(() => {
    const isDisconnected = Date.now() - lastDataTime > 4000; // 4s timeout

    if (isDisconnected && !disconnectedEmitted) {
        io.emit("vitals", {
            status: "DISCONNECTED",
            heart_rate: null,
            spo2: null
        });
        disconnectedEmitted = true;
    }
}, 1000); // Check every second

// --------------------
// SOCKET
// --------------------
io.on("connection", (socket) => {
    console.log("Frontend connected");
});

// --------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
