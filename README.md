# 🏥 IoT Patient Health Monitoring System

A real-time IoT-based ICU patient monitoring system that simulates and transmits vital signs (Heart Rate & SpO₂) from a local system to a cloud backend and visualizes them on a live web dashboard with critical alerts.

---

## 📌 Project Overview

This project demonstrates how patient vitals can be monitored remotely using IoT and web technologies.  
Vital signs are generated using a Python-based hospital monitor simulator, transmitted via an ESP8266 over Wi-Fi, processed by a cloud backend, and displayed in real time on a responsive ICU-style web interface.

The system is designed to mimic real hospital bedside monitors and supports **critical alerts with visual and audio alarms**.

---

## 🧩 System Architecture

```

Python ICU Monitor
↓ (USB Serial)
ESP8266 (Wi-Fi)
↓ (HTTP POST)
Cloud Backend (Render)
↓ (Socket.IO)
Web Dashboard (Vercel)

````

---

## ⚙️ Components Used

### Hardware
- ESP8266 (NodeMCU ESP-12E)
- USB Cable
- Wi-Fi Network

### Software
- Python 3.x (Tkinter, PySerial)
- Arduino IDE (ESP8266 Core)
- Node.js (Backend)
- Socket.IO (Real-time communication)
- React + Vite (Frontend)
- Render (Backend Hosting)
- Vercel (Frontend Hosting)

---

## 🧪 Features

- ✅ Real-time Heart Rate & SpO₂ monitoring
- ✅ Python-based ICU monitor simulator
- ✅ ESP8266 serial data ingestion
- ✅ Cloud-based data transmission
- ✅ Live web dashboard
- ✅ Critical alert detection
- ✅ Audible ICU alarm
- ✅ Acknowledge alert option
- ✅ Professional ICU-style UI
- ✅ Automatic disconnect detection

---

## 🚀 How It Works

1. **Python Application**
   - Simulates patient vitals.
   - Sends data every second via USB serial in the format:
     ```
     HR:78,SpO2:97
     ```

2. **ESP8266**
   - Listens to serial input from Python.
   - Parses incoming vitals.
   - Sends data to the backend using HTTPS POST requests.

3. **Backend (Node.js)**
   - Receives vitals via `/api/data`.
   - Immediately emits live data using Socket.IO.
   - Detects device disconnection.

4. **Frontend Dashboard**
   - Receives live data via sockets.
   - Displays vitals instantly.
   - Triggers visual and audio alerts on critical conditions.

---

## 🚨 Alert Logic

Alerts are triggered **instantly on the frontend** when:
- Heart Rate > 120 BPM  
- SpO₂ < 90 %

Alert includes:
- Red warning banner
- Pulsing vital cards
- ICU alarm sound
- Acknowledge button

---

## 🛠️ Setup Instructions

### 1️⃣ ESP8266 Setup
- Board: **NodeMCU 1.0 (ESP-12E)**
- Baud Rate: **115200**
- Upload ESP8266 serial-listener code
- Configure Wi-Fi credentials and backend URL

### 2️⃣ Python Simulator
```bash
python hospital_monitor.py
````

⚠️ Ensure Arduino Serial Monitor is CLOSED.

### 3️⃣ Backend (Render)

```bash
cd backend
npm install
node server.js
```

### 4️⃣ Frontend (Vercel / Local)

```bash
cd frontend
npm install
npm run dev
```

Add environment variable:

```
VITE_API_URL=https://<your-render-backend>.onrender.com
```

---

## 📊 Demo Modes

* **Python → ESP8266 → Cloud (Control Mode)**
* **ESP8266 Standalone Simulation Mode**
* **Cloud-only UI Testing**

---

## 🧠 Key Learning Outcomes

* Serial communication with microcontrollers
* Real-time IoT data pipelines
* Cloud backend integration
* WebSocket-based live dashboards
* Medical alert system design
* Debugging multi-layer systems

---

## 🎓 Academic Relevance

This project demonstrates:

* IoT architecture
* Embedded systems
* Cloud computing
* Real-time data visualization
* Healthcare technology applications

Ideal for:

* Mini Project
* Final Year Project
* IoT & Embedded Systems coursework

---

## ⚠️ Disclaimer

This project is for **educational purposes only**.
It is **not intended for real medical use**.

---

## 👤 Author

**Akhilesh Sirimalla**
IoT & Embedded Systems Enthusiast

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!

```

---

If you want next, I can:
- Simplify it for **college submission**
- Make a **one-page report**
- Add **screenshots section**
- Write **viva questions & answers**

Just tell me 👍
```
