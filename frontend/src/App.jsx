import React, { useState, useEffect, useRef } from 'react';
import socket from './services/socket';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Activity, Droplets, Volume2, VolumeX, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import clsx from 'clsx';

const App = () => {
  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------
  const [data, setData] = useState({ heart_rate: '--', spo2: '--' });
  const [history, setHistory] = useState([]); // Graph data
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED'); // CONNECTED, DISCONNECTED
  const [clinicalStatus, setClinicalStatus] = useState('NORMAL'); // NORMAL, WARNING, CRITICAL
  const [isAudioMuted, setIsAudioMuted] = useState(false); // Acknowledge state

  const audioRef = useRef(null);
  const audioIntervalRef = useRef(null);

  // -------------------------------------------------------------------------
  // AUDIO ENGINE (Zero Latency Loop)
  // -------------------------------------------------------------------------
  const playAlarmSound = () => {
    if (!audioRef.current) {
      audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioRef.current.state === 'suspended') {
      audioRef.current.resume();
    }

    // Prevent stacking interval
    if (audioIntervalRef.current) return;

    const beep = () => {
      const osc = audioRef.current.createOscillator();
      const gain = audioRef.current.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, audioRef.current.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, audioRef.current.currentTime + 0.15);

      gain.gain.setValueAtTime(0.5, audioRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioRef.current.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(audioRef.current.destination);

      osc.start();
      osc.stop(audioRef.current.currentTime + 0.2);
    };

    // Immediate first beep
    beep();
    // Loop every 500ms (High urgency)
    audioIntervalRef.current = setInterval(beep, 500);
  };

  const stopAlarmSound = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
  };

  // -------------------------------------------------------------------------
  // SOCKET & LOGIC ENGINE
  // -------------------------------------------------------------------------
  useEffect(() => {
    socket.on('connect', () => {
      console.log("SOCKET CONNECTED");
      setConnectionStatus('CONNECTED');
    });

    socket.on('disconnect', () => {
      console.log("SOCKET DISCONNECTED");
      setConnectionStatus('DISCONNECTED');
      setClinicalStatus('NORMAL'); // Reset alarm on disconnect
      stopAlarmSound();
    });

    socket.on('vitals', (payload) => {
      // ---> DEBUG LOG (Latency Verification) <---
      console.log("SOCKET DATA @", Date.now(), payload);

      // 1. Handle Disconnected Signal from Backend Watchdog
      if (payload.status === 'DISCONNECTED') {
        setConnectionStatus('DISCONNECTED');
        setData({ heart_rate: '--', spo2: '--' });
        setClinicalStatus('NORMAL');
        stopAlarmSound();
        return;
      }

      // 2. Process Live Data
      setConnectionStatus('CONNECTED');
      setData({ heart_rate: payload.heart_rate, spo2: payload.spo2 });

      // 3. DERIVE CLINICAL STATUS (Instant Logic)
      const hr = payload.heart_rate;
      const spo2 = payload.spo2;
      let newStatus = 'NORMAL';

      // Rules
      if (hr > 120 || spo2 < 90) newStatus = 'CRITICAL';
      else if (hr > 100 || spo2 < 94) newStatus = 'WARNING';

      setClinicalStatus(newStatus);

      // 4. TRIGGER ALARM (Immediate)
      if (newStatus === 'CRITICAL') {
        if (!isAudioMuted) {
          playAlarmSound();
        }
      } else {
        // Auto-Reset: If patient stabilizes, stop sound AND reset mute
        stopAlarmSound();
        if (newStatus === 'NORMAL') setIsAudioMuted(false);
      }

      // 5. Update Graph
      setHistory(prev => {
        const nav = [...prev, { hr, spo2, time: Date.now() }];
        return nav.slice(-50); // Keep last 50 points
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('vitals');
      stopAlarmSound();
    };
  }, [isAudioMuted]); // Re-bind listener if mute state changes to respect new logic

  // -------------------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------------------
  const handleAcknowledge = () => {
    stopAlarmSound();
    setIsAudioMuted(true); // Silences sound only, visual alert remains
  };

  // Resuming Audio Context on user click (Browser Policy)
  useEffect(() => {
    const resumeAudio = () => {
      if (audioRef.current?.state === 'suspended') audioRef.current.resume();
    };
    window.addEventListener('click', resumeAudio);
    return () => window.removeEventListener('click', resumeAudio);
  }, []);


  // -------------------------------------------------------------------------
  // RENDER (Professional Bedside Monitor Design)
  // -------------------------------------------------------------------------
  const getStatusColor = (s) => {
    if (s === 'CRITICAL') return 'text-red-500 border-red-500 bg-red-950/20';
    if (s === 'WARNING') return 'text-yellow-400 border-yellow-400 bg-yellow-950/20';
    return 'text-[#00ff9d] border-[#00ff9d] bg-emerald-950/20'; // Medical Green
  };

  return (
    <div className="w-screen h-screen bg-[#050505] text-[#e0e0e0] font-mono flex flex-col overflow-hidden selection:bg-none">

      {/* --- HEADER --- */}
      <header className="h-16 border-b border-[#333] flex items-center justify-between px-6 bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold tracking-tight text-[#888]">ICU MONITORING SYSTEM</div>
          <div className="h-6 w-px bg-[#333]" />
          <div className="text-lg font-bold text-white tracking-widest">UNIT 01 • BED A</div>
        </div>

        <div className={clsx(
          "px-4 py-1.5 rounded text-sm font-bold tracking-wider flex items-center gap-2 uppercase",
          connectionStatus === 'CONNECTED'
            ? (clinicalStatus === 'CRITICAL' ? "bg-red-600 text-white animate-pulse" : "bg-[#003300] text-[#00ff9d]")
            : "bg-orange-900/50 text-orange-500 border border-orange-500"
        )}>
          {connectionStatus === 'CONNECTED' ? <Wifi size={16} /> : <WifiOff size={16} />}
          {connectionStatus === 'CONNECTED' ? connectionStatus : 'DISCONNECTED'}
        </div>
      </header>

      {/* --- ALERT BANNER (Starts Hidden) --- */}
      {clinicalStatus === 'CRITICAL' && (
        <div className="bg-red-600 text-white text-center py-2 font-black tracking-[0.2em] animate-pulse text-lg uppercase shadow-[0_0_50px_rgba(220,38,38,0.5)] z-50">
          ⚠️ CRITICAL VITALS DETECTED
        </div>
      )}

      {/* --- MAIN DISPLAY --- */}
      <div className="flex-1 p-6 grid grid-rows-[3fr_2fr] gap-6 relative">

        {/* VITAL CARDS ROW */}
        <div className="grid grid-cols-2 gap-6">

          {/* HEART RATE */}
          <div className={clsx(
            "rounded relative border-2 flex flex-col justify-between p-6 transition-colors duration-200",
            getStatusColor(connectionStatus === 'DISCONNECTED' ? 'NORMAL' : clinicalStatus)
          )}>
            <div className="flex justify-between items-start">
              <span className="text-sm font-bold opacity-70 tracking-widest">HEART RATE</span>
              <Activity size={24} className={clsx(clinicalStatus === 'CRITICAL' && "animate-pulse")} />
            </div>

            <div className="flex items-end justify-center">
              <span className="text-[10rem] leading-none font-bold tracking-tighter tabular-nums drop-shadow-2xl">
                {data.heart_rate}
              </span>
            </div>

            <div className="flex justify-between items-end">
              <span className="text-4xl font-bold opacity-60">BPM</span>
              <div className="text-right">
                <div className="text-xs opacity-50 uppercase">Limits</div>
                <div className="font-bold">60 - 100</div>
              </div>
            </div>
          </div>

          {/* SpO2 */}
          <div className={clsx(
            "rounded relative border-2 flex flex-col justify-between p-6 transition-colors duration-200",
            // SpO2 often stays blue/cyan unless extremely low, but can follow alert color
            clinicalStatus === 'CRITICAL' && data.spo2 < 90
              ? 'text-red-500 border-red-500 bg-red-950/20'
              : 'text-cyan-400 border-cyan-400 bg-cyan-950/20'
          )}>
            <div className="flex justify-between items-start">
              <span className="text-sm font-bold opacity-70 tracking-widest">SpO₂</span>
              <Droplets size={24} />
            </div>

            <div className="flex items-end justify-center">
              <span className="text-[10rem] leading-none font-bold tracking-tighter tabular-nums drop-shadow-2xl">
                {data.spo2}
              </span>
            </div>

            <div className="flex justify-between items-end">
              <span className="text-4xl font-bold opacity-60">%</span>
              <div className="text-right">
                <div className="text-xs opacity-50 uppercase">Limits</div>
                <div className="font-bold">90 - 100</div>
              </div>
            </div>
          </div>
        </div>

        {/* GRAPH ROW */}
        <div className="border border-[#333] bg-[#080808] rounded relative p-4">
          <div className="absolute top-2 left-4 text-xs font-bold text-[#888] tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Real-Time ECG Pleth
          </div>
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Line
                  type="monotone"
                  dataKey="hr"
                  stroke={clinicalStatus === 'CRITICAL' ? '#ef4444' : '#00ff9d'}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>


        {/* ALERT OVERLAY / CONTROLS (Floating) */}
        {clinicalStatus === 'CRITICAL' && (
          <div className="absolute bottom-6 right-6 flex items-center gap-4 z-50">
            <button
              onClick={handleAcknowledge}
              disabled={isAudioMuted}
              className={clsx(
                "px-8 py-4 rounded font-bold text-xl uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-transform active:scale-95",
                isAudioMuted
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600"
                  : "bg-yellow-500 text-black animate-bounce border-2 border-yellow-300"
              )}>
              {isAudioMuted ? <VolumeX /> : <Volume2 />}
              {isAudioMuted ? "ALARM SILENCED" : "ACKNOWLEDGE"}
            </button>
          </div>
        )}
      </div>

      {/* --- FOOTER --- */}
      <footer className="h-8 bg-[#0a0a0a] border-t border-[#333] flex items-center justify-between px-6 text-[10px] text-[#444] uppercase">
        <div>Live data via IoT Gateway • Latency: &lt;50ms</div>
        <div>System Active • {new Date().toLocaleTimeString()}</div>
      </footer>
    </div>
  );
};

export default App;
