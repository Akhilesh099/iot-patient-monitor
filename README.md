# VitalEye ICU Monitor 🏥

**A Real-Time IoT Patient Health Monitoring System**

VitalEye is a full-stack IoT solution designed to simulate a hospital bedside monitor. It collects real-time patient vitals (Heart Rate & SpO₂) from an ESP8266 device (or Python simulator), transmits them to a cloud backend, and visualizes them on a live, responsive React dashboard with critical alert capabilities.

---

## 🚀 Features

- **Real-time Monitoring**: WebSocket-based data streaming with sub-second latency.
- **Critical Alerts**: Instant visual and audio triggers when Heart Rate > 120 bpm or SpO₂ < 90%.
- **Live Graphs**: Dynamic visualization of patient vital trends using Recharts.
- **Reliability**: Automatic device disconnection detection.
- **PWA Support**: Installable on desktop and mobile devices for a native-app experience.
- **Mobile Ready**: Fully responsive design suitable for tablets and phones.
- **Demo Modes**: Supports hardware (ESP8266) and software-only simulation.

---

## 🏗️ System Architecture

```ascii
+------------------+       +------------------+       +------------------+
|   Python Sim     |       |     ESP8266      |       |   Cloud Backend  |
| (Patient Vitals) |------>| (Wi-Fi Gateway)  |------>| (Node.js/Express)|
+------------------+  USB  +------------------+ HTTPS +------------------+
                                                                |
                                                                | Socket.IO
                                                                v
                                                      +------------------+
                                                      |   Web Dashboard  |
                                                      |   (React/Vite)   |
                                                      +------------------+
```

---

## 🛠️ Tech Stack

- **Hardware**: ESP8266 (NodeMCU ESP-12E)
- **Firmware**: Arduino C++
- **Simulator**: Python 3 (Tkinter, PySerial)
- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: React, Vite, TailwindCSS, Recharts
- **Communication**: REST API (Ingestion), WebSockets (Broadcast)
- **Deployment**: Render (Backend), Vercel (Frontend)

---

## 🚀 How It Works

1.  **Python Simulator**: Generates synthetic patient data (Heart Rate, SpO₂) and sends it via USB Serial to the ESP8266.
    -   *Format*: `HR:78,SpO2:97`
2.  **ESP8266 Gateway**: Reads the serial data, parses it, and transmits it to the cloud backend via HTTPS POST requests.
3.  **Backend Processing**: The Node.js server receives the data, validates it, and broadcasts it immediately to all connected clients using Socket.IO.
4.  **Frontend Visualization**: The React dashboard receives the live stream, updates the charts instanly, and checks for critical thresholds to trigger alerts.

---

## 🚨 Alert Logic

The system is designed for immediate response to critical conditions. Alerts are triggered **locally on the frontend** to ensure zero latency.

-   **Heart Rate > 120 BPM**: High heart rate warning.
-   **SpO₂ < 90%**: Low oxygen saturation warning.

**Response**:
-   🔴 Red full-screen warning banner.
-   🔊 Audible ICU alarm sound.
-   💓 Pulsing vital checklists.
-   ✅ "Acknowledge" button to silence the alarm.

---

## 📝 Setup Instructions

### 1. ESP8266 Setup (Hardware)
1.  Connect **NodeMCU ESP-12E** to your PC.
2.  Open **Arduino IDE** and select the board.
3.  Flash the firmware located in `backend/firmware_reference.cpp`.
4.  **Configuration**:
    -   Update `ssid` and `password` with your Wi-Fi credentials.
    -   Update `serverUrl` to your deployed backend URL.

### 2. Python Simulator (Data Source)
1.  Install Python 3.x.
2.  Run the simulator script:
    ```bash
    python hospital_monitor.py
    ```
3.  **Note**: Ensure the Arduino Serial Monitor is **CLOSED** before running the script.

### 3. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    npm start
    ```
    *Runs on http://localhost:5000*

### 4. Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    *Runs on http://localhost:5173*

---

## 📦 Deployment

### Backend (Render/Heroku/Railway)
-   **Build Command**: `npm install`
-   **Start Command**: `node server.js`
-   **Env Vars**: `PORT=5000` (optional)

### Frontend (Vercel/Netlify)
-   **Build Command**: `npm run build`
-   **Output Directory**: `dist`
-   **Configuration**: Set `VITE_API_URL` environment variable to your deployed backend URL.

---

## 📊 Demo Modes

1.  **Full Loop (Control Mode)**: Python Sim → Serial → ESP8266 → Cloud → Dashboard.
2.  **Standalone Simulation**: ESP8266 generating random data internally (if Serial unavailable).
3.  **Cloud Testing**: Send manual POST requests to the backend using Postman/Curl.

---

## 🧠 Learning Outcomes
-   Interfacing Python with Microcontrollers via Serial.
-   Building real-time Full-Stack IoT pipelines.
-   Handling high-frequency data streams with WebSockets.
-   Implementing critical thresholds and audio alerts in React.
-   Deploying a distributed system (Hardware + Cloud + Web).

---

## 🎓 Academic Relevance
This project is ideal for **Final Year Projects** or **IoT Coursework**, demonstrating:
-   **IoT Architecture**: Edge (ESP8266) to Cloud to Client.
-   **Embedded Systems**: Serial communication and Wi-Fi handling.
-   **Web Development**: Modern React UI and PWA implementation.

---

## ⚠️ Disclaimer
This project is for **educational purposes only**. It is **not** a certified medical device and should not be used for actual patient monitoring or diagnosis.

---

## 👤 Author
**Akhilesh Sirimalla**
IoT & Embedded Systems Enthusiast

---

## 📄 License
MIT License. Created for Academic Demonstration.
