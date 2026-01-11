import { io } from "socket.io-client";

console.log("Attempting to connect to https://iot-backend-248u.onrender.com...");

const socket = io("https://iot-backend-248u.onrender.com", {
    transports: ["websocket", "polling"]
});

socket.on("connect", () => {
    console.log("Check 1 Result: A) Socket connected");
    console.log("Check 2 Result: YES (Backend accepted connection)");
});

socket.on("connect_error", (err) => {
    console.log("Check 1 Result: B) WebSocket connection failed", err.message);
});

socket.on("vitals", (data) => {
    console.log("Received Data:", data);
    // process.exit(0); // Optional: keep running to see multiple
});

setTimeout(() => {
    console.log("Timeout check.");
    process.exit(0);
}, 5000);
