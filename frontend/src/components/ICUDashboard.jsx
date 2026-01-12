import { useEffect, useState, useRef } from "react";
import { socket } from "../services/socket";
import "./../icu.css";

export default function ICUDashboard() {
    const [hr, setHr] = useState("--");
    const [spo2, setSpo2] = useState("--");
    const [status, setStatus] = useState("CONNECTED");
    const [critical, setCritical] = useState(false);

    // Ref to track if the CURRENT critical session has been acknowledged
    const acknowledgedRef = useRef(false);

    // Audio Refs
    const audioContextRef = useRef(null);
    const intervalRef = useRef(null);

    // Initialize Audio Context on User Interaction
    useEffect(() => {
        const initAudio = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
        };

        window.addEventListener('click', initAudio);
        window.addEventListener('touchstart', initAudio);
        return () => {
            window.removeEventListener('click', initAudio);
            window.removeEventListener('touchstart', initAudio);
        };
    }, []);

    const startAlarm = () => {
        // If already running or acknowledged, do nothing
        if (intervalRef.current || acknowledgedRef.current) return;

        const playTone = () => {
            if (!audioContextRef.current) return;
            if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();

            const osc = audioContextRef.current.createOscillator();
            const gain = audioContextRef.current.createGain();

            // New Sound: High-Pitch Pulsing Square Wave (Medical Style)
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, audioContextRef.current.currentTime); // High A5
            osc.frequency.setValueAtTime(1100, audioContextRef.current.currentTime + 0.1); // Jump to C#6

            gain.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
            gain.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.3);

            osc.connect(gain);
            gain.connect(audioContextRef.current.destination);

            osc.start();
            osc.stop(audioContextRef.current.currentTime + 0.3);
        };

        playTone();
        // Faster urgency: 3 times a second
        intervalRef.current = setInterval(playTone, 330);
    };

    const stopAlarm = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const acknowledgeAlert = () => {
        stopAlarm();
        acknowledgedRef.current = true; // Latch: Don't sound again until we return to normal first
        // We keep the visual red state (critical=true) to show danger, but sound is off
    };

    useEffect(() => {
        socket.on("connect", () => setStatus("CONNECTED"));
        socket.on("disconnect", () => {
            setStatus("DISCONNECTED");
            setHr("--");
            setSpo2("--");
            stopAlarm();
        });

        const handleData = (data) => {
            if (data.heart_rate !== undefined && data.spo2 !== undefined) {
                const numHr = parseInt(data.heart_rate);
                const numSpo2 = parseInt(data.spo2);

                setHr(numHr);
                setSpo2(numSpo2);

                const isNowCritical = numHr > 120 || numSpo2 < 90;

                setCritical(isNowCritical);

                if (isNowCritical) {
                    setStatus("CRITICAL");
                    // Only start alarm if NOT acknowledged
                    if (!acknowledgedRef.current) {
                        startAlarm();
                    }
                } else {
                    // Patient is stable
                    setStatus("NORMAL");
                    stopAlarm();
                    acknowledgedRef.current = false; // Reset latch so NEXT crisis will trigger alarm
                }
            }
        };

        socket.on("liveData", handleData);
        socket.on("vitals", handleData);

        return () => {
            socket.off("liveData");
            socket.off("vitals");
            socket.off("connect");
            socket.off("disconnect");
            stopAlarm();
        };
    }, []);

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
                    {acknowledgedRef.current ? (
                        <button disabled style={{ opacity: 0.5, cursor: 'not-allowed', borderColor: '#555', color: '#888' }}>
                            ALARM SILENCED
                        </button>
                    ) : (
                        <button onClick={acknowledgeAlert}>
                            ACKNOWLEDGE ALERT
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
