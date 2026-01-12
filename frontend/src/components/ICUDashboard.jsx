import { useEffect, useState, useRef } from "react";
import { socket } from "../services/socket";
import "./../icu.css";

export default function ICUDashboard() {
    const [hr, setHr] = useState("--");
    const [spo2, setSpo2] = useState("--");
    const [status, setStatus] = useState("CONNECTED");
    const [critical, setCritical] = useState(false);

    // Use AudioContext for reliable alarm generation without external assets
    const audioContextRef = useRef(null);
    const oscillatorRef = useRef(null);
    const intervalRef = useRef(null);

    const startAlarm = () => {
        if (intervalRef.current) return; // Already running

        const playBeep = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }

            const osc = audioContextRef.current.createOscillator();
            const gain = audioContextRef.current.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, audioContextRef.current.currentTime + 0.2);

            gain.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.2);

            osc.connect(gain);
            gain.connect(audioContextRef.current.destination);

            osc.start();
            osc.stop(audioContextRef.current.currentTime + 0.25);
        };

        playBeep();
        intervalRef.current = setInterval(playBeep, 500);
    };

    const stopAlarm = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        // Initial connection handling
        socket.on("connect", () => {
            setStatus("CONNECTED");
        });

        socket.on("disconnect", () => {
            setStatus("DISCONNECTED");
            setHr("--");
            setSpo2("--");
            stopAlarm();
        });

        // Handle incoming data
        // Supports both 'liveData' (from user snippet) and 'vitals' (from previous backend implementation)
        // to ensure compatibility with whatever the backend is emitting.
        const handleData = (data) => {
            // Logic from user snippet
            if (data.heart_rate !== undefined && data.spo2 !== undefined) {
                setHr(data.heart_rate);
                setSpo2(data.spo2);

                // Logic from user snippet: hr > 120 || spo2 < 90
                // Converting to numbers just in case
                const numHr = parseInt(data.heart_rate);
                const numSpo2 = parseInt(data.spo2);

                const isCritical = numHr > 120 || numSpo2 < 90;

                setCritical(isCritical);
                setStatus(isCritical ? "CRITICAL" : "NORMAL");

                if (isCritical) {
                    startAlarm();
                } else {
                    stopAlarm();
                }
            }
        };

        socket.on("liveData", handleData);
        socket.on("vitals", handleData); // Fallback for existing backend

        return () => {
            socket.off("liveData");
            socket.off("vitals");
            socket.off("connect");
            socket.off("disconnect");
            stopAlarm();
        };
    }, []);

    const acknowledgeAlert = () => {
        stopAlarm();
        setCritical(false);
    };

    return (
        <div className="icu-container">
            <header>
                <h1>ICU MONITORING</h1>
                <div className={`badge ${status.toLowerCase()}`}>
                    {status}
                </div>
            </header>

            <div className="panels">
                <div className={`panel ${critical ? "danger" : ""}`}>
                    <h2>HEART RATE</h2>
                    <div className="value">{hr}</div>
                    <span className="unit">BPM</span>
                </div>

                <div className={`panel ${critical ? "danger" : ""}`}>
                    <h2>SpO₂</h2>
                    <div className="value">{spo2}%</div>
                    <span className="unit">%</span>
                </div>
            </div>

            {critical && (
                <div className="alert">
                    <h2>⚠️ CRITICAL PATIENT CONDITION</h2>
                    <button onClick={acknowledgeAlert}>
                        ACKNOWLEDGE ALERT
                    </button>
                </div>
            )}
        </div>
    );
}
