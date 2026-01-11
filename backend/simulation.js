const axios = require('axios');

const API_URL = 'http://localhost:5000/api/vitals';

// Simulation Parameters
let heartRate = 75;
let spo2 = 98;
let tick = 0;

console.log('Starting ESP32 Simulation...');
console.log(`Target: ${API_URL}`);

function simulate() {
    tick += 0.1;

    // Add some sine wave fluctuation + random noise
    heartRate = 75 + Math.sin(tick) * 10 + (Math.random() - 0.5) * 5;
    spo2 = 97 + Math.sin(tick * 0.5) * 2 + (Math.random() - 0.5);

    // Bounds
    if (spo2 > 100) spo2 = 100;
    if (spo2 < 85) spo2 = 85;

    // Occasional random drop to trigger alert simulating a critical event
    if (Math.random() < 0.05) {
        console.log('--- SIMULATING CRITICAL DROP ---');
        heartRate = 135; // Critical High
        spo2 = 88;       // Critical Low
    }

    const payload = {
        heart_rate: Math.round(heartRate),
        spo2: Math.round(spo2),
        timestamp: new Date().toISOString()
    };

    axios.post(API_URL, payload)
        .then(() => {
            console.log(`Sent: HR=${payload.heart_rate}, SpO2=${payload.spo2}`);
        })
        .catch(err => {
            console.error('Error sending data:', err.message);
        });
}

// Send data every 1 second
setInterval(simulate, 1000);
