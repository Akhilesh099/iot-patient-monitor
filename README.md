# VitalEye ICU Monitor 🏥

A full-stack IoT solution simulating a hospital bedside monitor. It collects real-time patient vitals (Heart Rate & SpO₂) from an ESP32 device (or simulator), processes them for critical thresholds, and displays them on a live React dashboard.

## 🚀 Features
- **Real-time Monitoring**: WebSocket-based data streaming (Latency < 100ms).
- **Critical Alerts**: Instant triggers when Heart Rate > 120 bpm or SpO₂ < 90%.
- **Live Graphs**: Dynamic visualization of patient trends.
- **Reliability**: Auto-detects device disconnection.
- **PWA Support**: Installable on desktop and mobile devices for a native-app experience.
- **Mobile Ready**: Responsive design suitable for tablets and phones.

---

## 🏗️ Architecture
- **Hardware**: ESP32 (C++) / Node.js Simulator
- **Backend**: Node.js, Express, Socket.io (Handles logic & alert state)
- **Frontend**: React, Vite, TailwindCSS, Recharts (Visualizes data)
- **Communication**: REST API (Ingestion) & WebSockets (Broadcast)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn

### 1. Installation

**Backend**
```bash
cd backend
npm install
```

**Frontend**
```bash
cd frontend
npm install
```

### 2. Running Locally

**Terminal 1: Start Backend**
```bash
cd backend
npm start
```
*Runs on http://localhost:5000*

**Terminal 2: Start Frontend**
```bash
cd frontend
npm run dev
```
*Runs on http://localhost:5173*

**Terminal 3: Start Simulation (Optional)**
If you don't have an ESP32, run this script to generate fake patient data:
```bash
cd backend
node simulation.js
```

---

## 📦 Deployment Guide

### Environment Variables
Create a `.env` file in `backend/` (optional for local, required for prod):
```
PORT=5000
```
*Note: Frontend connects to backend URL defined in `frontend/src/services/socket.js`. Update this for production.*

### Deploying Backend (Render/Heroku/Railway)
1. Push code to GitHub.
2. Link repo to deployment service.
3. **Root Directory**: `backend`
4. **Build Command**: `npm install`
5. **Start Command**: `node server.js`

### Deploying Frontend (Vercel/Netlify)
1. Push code to GitHub.
2. Link repo to Vercel.
3. **Root Directory**: `frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Important**: Update `frontend/src/services/socket.js` to point to your deployed Backend URL (e.g., `https://my-backend.onrender.com`).

---

## 🔌 Hardware (ESP32)
Flash the code in `backend/firmware_reference.cpp` to your ESP32.
- Update `ssid` and `password`.
- Update `serverUrl` to your backend's IP/URL.

---

## 📜 License
MIT License. Created for Academic Project Demonstration.
