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
let status = "DISCONNECTED";

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
    const { heart_rate, spo2 } = req.body;

    if (!heart_rate || !spo2) {
        return res.status(400).json({ error: "Invalid data" });
    }

    lastDataTime = Date.now();

    // Alert logic
    // "If heart_rate > 120 or spo2 < 90" logic from previous context, 
    // keeping it consistent with the user's snippet logic below.
    if (heart_rate > 120 || spo2 < 90) {
        status = "CRITICAL";
    } else {
        status = "NORMAL";
    }

    const payload = {
        heart_rate,
        spo2,
        status,
        timestamp: new Date().toISOString()
    };

    console.log("Received:", payload);

    io.emit("vitals", payload);

    res.status(200).json({ success: true });
});

// --------------------
// DISCONNECT WATCHDOG
// --------------------
setInterval(() => {
    if (Date.now() - lastDataTime > 5000) {
        io.emit("vitals", {
            status: "DISCONNECTED",
            heart_rate: null,
            spo2: null
        });
    }
}, 3000);

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
