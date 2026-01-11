import React, { useState, useEffect, useRef } from 'react';
import socket from './services/socket';
import { Volume2, VolumeX, Wifi, WifiOff, AlertTriangle, Menu, Battery, Activity } from 'lucide-react';
import clsx from 'clsx';
import HeroHeartRate from './components/HeroHeartRate';
import SpO2Panel from './components/SpO2Panel';
import ECGGraph from './components/ECGGraph';
import GlassPanel from './components/GlassPanel';

const App = () => {
  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------
  const [data, setData] = useState({ heart_rate: '--', spo2: '--' });
  const [history, setHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
  const [clinicalStatus, setClinicalStatus] = useState('NORMAL');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const audioRef = useRef(null);
  const audioIntervalRef = useRef(null);

  // -------------------------------------------------------------------------
  // AUDIO ENGINE
  // -------------------------------------------------------------------------
  const playAlarmSound = () => {
    if (!audioRef.current) {
      audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioRef.current.state === 'suspended') {
      audioRef.current.resume();
    }
    if (audioIntervalRef.current) return;

    const beep = () => {
      const osc = audioRef.current.createOscillator();
      const gain = audioRef.current.createGain();
      osc.type = 'sawtooth'; // More aggressive for medical alarm
      osc.frequency.setValueAtTime(900, audioRef.current.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioRef.current.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, audioRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioRef.current.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioRef.current.destination);
      osc.start();
      osc.stop(audioRef.current.currentTime + 0.15);
    };

    beep();
    audioIntervalRef.current = setInterval(beep, 400); // Faster pulse
  };

  const stopAlarmSound = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
  };

  // -------------------------------------------------------------------------
  // SOCKET LOGIC
  // -------------------------------------------------------------------------
  useEffect(() => {
    socket.on('connect', () => {
      setConnectionStatus('CONNECTED');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('DISCONNECTED');
      setClinicalStatus('NORMAL'); // Reset to avoid stuck processing
      stopAlarmSound();
    });

    socket.on('vitals', (payload) => {
      setLastUpdated(new Date());

      if (payload.status === 'DISCONNECTED') {
        setConnectionStatus('DISCONNECTED');
        setData({ heart_rate: '--', spo2: '--' });
        setClinicalStatus('NORMAL');
        stopAlarmSound();
        return;
      }

      setConnectionStatus('CONNECTED');
      setData({ heart_rate: payload.heart_rate, spo2: payload.spo2 });

      const hr = parseInt(payload.heart_rate) || 0;
      const spo2 = parseInt(payload.spo2) || 0;
      let newStatus = 'NORMAL';

      if (hr > 120 || spo2 < 90) newStatus = 'CRITICAL';
      else if (hr > 100 || spo2 < 94) newStatus = 'WARNING';

      setClinicalStatus(newStatus);

      if (newStatus === 'CRITICAL') {
        if (!isAudioMuted) playAlarmSound();
      } else {
        stopAlarmSound();
        if (newStatus === 'NORMAL') setIsAudioMuted(false);
      }

      setHistory(prev => {
        const nav = [...prev, { hr, spo2, time: Date.now() }];
        return nav.slice(-200); // Keep more history for scrolling
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('vitals');
      stopAlarmSound();
    };
  }, [isAudioMuted]);

  const handleAcknowledge = () => {
    stopAlarmSound();
    setIsAudioMuted(true);
  };

  // -------------------------------------------------------------------------
  // RENDER (ULTRA-PREMIUM LAYOUT)
  // -------------------------------------------------------------------------
  return (
    <div className={clsx(
      "w-screen h-screen flex flex-col overflow-hidden relative selection:bg-none transition-colors duration-1000",
      clinicalStatus === 'CRITICAL' ? "bg-red-950/20" : "bg-black"
    )}>

      {/* VIGNETTE RED FLASH (CRITICAL) */}
      <div className={clsx(
        "absolute inset-0 pointer-events-none z-50 transition-opacity duration-300 radial-overlay",
        clinicalStatus === 'CRITICAL' ? "opacity-100 animate-pulse-slow bg-gradient-to-r from-red-900/40 via-transparent to-red-900/40" : "opacity-0"
      )} style={{ boxShadow: 'inset 0 0 150px rgba(255,0,0,0.5)' }} />

      {/* --- HEADER --- */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-panel-border bg-panel-bg backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <Menu className="text-gray-500 w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold font-sans tracking-widest text-white leading-none">
              VITAL<span className="text-medical-cyan">EYE</span>
            </h1>
            <span className="text-[10px] text-gray-400 font-mono tracking-[0.3em] uppercase">Advanced ICU Monitoring</span>
          </div>
        </div>

        {/* Center: Alert Banner */}
        {clinicalStatus === 'CRITICAL' && (
          <div className="absolute left-1/2 -translate-x-1/2 bg-medical-red px-12 py-1 rounded-b-lg shadow-[0_0_30px_rgba(255,0,60,0.6)] animate-flash-critical z-50">
            <span className="text-black font-black tracking-widest text-lg uppercase">CRITICAL ALERT</span>
          </div>
        )}

        <div className="flex items-center gap-6 font-mono text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <span>{lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}</span>
          </div>
          <div className={clsx(
            "flex items-center gap-2 px-3 py-1 rounded border tracking-wider transition-all duration-300",
            connectionStatus === 'CONNECTED'
              ? "border-medical-green/30 text-medical-green bg-medical-green/5"
              : "border-medical-red/50 text-medical-red animate-pulse bg-medical-red/10"
          )}>
            {connectionStatus === 'CONNECTED' ? <Wifi size={14} /> : <WifiOff size={14} />}
            {connectionStatus === 'CONNECTED' ? 'ONLINE' : 'OFFLINE'}
          </div>
          <Battery className="w-5 h-5 text-medical-green" />
        </div>
      </header>

      {/* --- MAIN GRID --- */}
      <main className="flex-1 p-4 grid grid-cols-12 grid-rows-[3fr_2fr] gap-4 z-30 relative">

        {/* TOP LEFT: HERO HEART RATE (8 cols) */}
        <div className="col-span-12 md:col-span-8 row-span-1">
          <HeroHeartRate
            heartRate={data.heart_rate}
            history={history}
            status={clinicalStatus}
          />
        </div>

        {/* TOP RIGHT: SPO2 PANEL (4 cols) */}
        <div className="col-span-12 md:col-span-4 row-span-1">
          <SpO2Panel
            spo2={data.spo2}
            history={history}
            status={clinicalStatus}
          />
        </div>

        {/* BOTTOM: FULL WIDTH ECG (Entire Row) */}
        <div className="col-span-12 row-span-1">
          <GlassPanel className="h-full p-2 relative">
            <div className="absolute top-2 left-4 z-20 flex gap-4 text-xs font-mono text-gray-400">
              <span className="text-medical-green font-bold">II</span>
              <span>25 mm/s</span>
              <span>FILTER ON</span>
            </div>
            <ECGGraph data={history} status={clinicalStatus} />
          </GlassPanel>
        </div>
      </main>

      {/* --- EMERGENCY CONTROLS (Floating Bottom Right) --- */}
      <div className="absolute bottom-6 right-6 z-50">
        <button
          onClick={handleAcknowledge}
          className={clsx(
            "flex items-center gap-3 px-6 py-3 rounded-lg font-bold font-sans tracking-widest text-sm uppercase transition-all duration-300 shadow-xl backdrop-blur-md border",
            clinicalStatus === 'CRITICAL' && !isAudioMuted
              ? "bg-medical-yellow text-black border-medical-yellow animate-bounce"
              : "bg-black/80 text-gray-400 border-gray-700 hover:text-white"
          )}
        >
          {isAudioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          {isAudioMuted ? "ALARM SILENCED" : "ACKNOWLEDGE"}
        </button>
      </div>

    </div>
  );
};

export default App;
