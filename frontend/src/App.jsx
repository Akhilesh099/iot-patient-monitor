import React, { useState, useEffect, useRef } from 'react';
import socket from './services/socket';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Droplets, AlertTriangle, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import clsx from 'clsx';

const App = () => {
  const [vitals, setVitals] = useState({ heart_rate: 0, spo2: 0 });
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('DISCONNECTED'); // NORMAL, CRITICAL, DISCONNECTED
  const [acknowledged, setAcknowledged] = useState(false); // Track if user dismissed current alert
  const [deviceConnected, setDeviceConnected] = useState(false);

  // Audio Ref
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);

  // --- SOUND ENGINE ---
  const playAlarm = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    if (oscillatorRef.current) return; // Already playing

    // Siren Logic (Modulated Square Wave)
    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, audioContextRef.current.currentTime); // A5
    osc.frequency.linearRampToValueAtTime(440, audioContextRef.current.currentTime + 0.5); // Drop to A4

    // LFO for "Warble"
    const lfo = audioContextRef.current.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 4; // Hz
    const lfoGain = audioContextRef.current.createGain();
    lfoGain.gain.value = 50;

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);

    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);

    osc.start();
    lfo.start();

    oscillatorRef.current = { osc, lfo };
  };

  const stopAlarm = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.osc.stop();
        oscillatorRef.current.lfo.stop();
      } catch (e) { }
      oscillatorRef.current = null;
    }
  };

  // --- LOGIC ENGINE ---
  useEffect(() => {
    socket.on('connect', () => console.log('Connected'));

    socket.on('disconnect', () => {
      setDeviceConnected(false);
      setStatus('DISCONNECTED');
      stopAlarm();
    });

    socket.on('vitals', (data) => {
      if (data.heart_rate && data.spo2) {
        setDeviceConnected(true);
        setVitals(data);
        const newStatus = data.status || 'NORMAL';
        setStatus(newStatus);

        // 1. AUTO-DISMISS: If normal, clear alert & reset acknowledgment
        if (newStatus === 'NORMAL') {
          stopAlarm();
          setAcknowledged(false); // Reset so next alarm triggers
        }

        // 2. SMART ALARM: Trigger only if CRITICAL and NOT acknowledged
        else if (newStatus === 'CRITICAL') {
          if (!acknowledged) {
            playAlarm();
          } else {
            stopAlarm(); // Ensure it stays off if acknowledged
          }
        }

        // Update History
        setHistory(prev => {
          const newHistory = [...prev, { ...data, time: new Date().toLocaleTimeString().slice(0, 5) }];
          return newHistory.slice(-20);
        });
      }
    });

    return () => {
      socket.off('connect'); socket.off('disconnect'); socket.off('vitals'); stopAlarm();
    };
  }, [acknowledged]); // Re-run logic if acknowledged state changes

  // Manual Dismiss Handler
  const handleDismiss = () => {
    stopAlarm();
    setAcknowledged(true); // Mute until next distinct NORMAL -> CRITICAL cycle
  };

  // --- RENDER ---
  return (
    <div className={clsx(
      "min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans transition-all duration-700 flex flex-col gap-8",
      status === 'CRITICAL' && !acknowledged && "shadow-[inset_0_0_100px_rgba(220,38,38,0.5)]"
    )}>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Activity className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              ICU VITALEYE
            </h1>
            <p className="text-xs text-gray-500 font-mono tracking-[0.2em] uppercase">Advanced Monitoring System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={clsx(
            "px-5 py-2 rounded-full border flex items-center gap-3 text-sm font-bold tracking-wide shadow-2xl backdrop-blur-md",
            status === 'DISCONNECTED' ? "border-gray-700 bg-gray-900/80 text-gray-400" :
              (status === 'NORMAL' ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-400" : "border-red-500 bg-red-600 text-white animate-pulse")
          )}>
            <div className={clsx(
              "w-2.5 h-2.5 rounded-full",
              status === 'DISCONNECTED' ? "bg-gray-500" :
                (status === 'NORMAL' ? "bg-emerald-400 animate-pulse" : "bg-white animate-ping")
            )} />
            {status === 'DISCONNECTED' ? 'OFFLINE' : (status === 'NORMAL' ? 'STABLE' : 'CRITICAL')}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">

        {/* Heart Rate Widget */}
        <div className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-[2rem] relative overflow-hidden group hover:border-red-500/30 transition-all duration-500 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><Activity size={18} /></div>
              <span className="text-gray-400 font-bold tracking-wider text-xs">HEART RATE</span>
            </div>
            {status === 'CRITICAL' && <span className="text-red-500 animate-pulse text-xs font-bold">⚠️ HIGH</span>}
          </div>

          <div className="flex items-baseline gap-4">
            <span className={clsx(
              "text-8xl font-black tabular-nums tracking-tighter drop-shadow-2xl",
              status === 'DISCONNECTED' ? "text-gray-700" : "text-white"
            )}>
              {status === 'DISCONNECTED' ? '--' : vitals.heart_rate}
            </span>
            <span className="text-red-500 text-sm font-bold uppercase tracking-widest mb-4">BPM</span>
          </div>

          {/* Heart Graphic */}
          <div className="mt-8 flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <div key={i} className="flex-1 bg-gray-800 h-8 rounded-sm overflow-hidden flex items-end">
                <div
                  className="w-full bg-red-600/80 transition-all duration-300"
                  style={{ height: `${Math.random() * 100}%`, opacity: status === 'DISCONNECTED' ? 0.2 : 1 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* SpO2 Widget */}
        <div className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-[2rem] relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-500 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500"><Droplets size={18} /></div>
              <span className="text-gray-400 font-bold tracking-wider text-xs">OXYGEN</span>
            </div>
          </div>

          <div className="flex items-baseline gap-4">
            <span className={clsx(
              "text-8xl font-black tabular-nums tracking-tighter drop-shadow-2xl",
              status === 'DISCONNECTED' ? "text-gray-700" : "text-white"
            )}>
              {status === 'DISCONNECTED' ? '--' : vitals.spo2}
            </span>
            <span className="text-cyan-500 text-sm font-bold uppercase tracking-widest mb-4">%</span>
          </div>

          <div className="mt-8 w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 shadow-[0_0_15px_currentColor] transition-all duration-1000"
              style={{ width: `${vitals.spo2}%` }}
            />
          </div>
        </div>

        {/* Control & Alert Center */}
        <div className="flex flex-col gap-6">

          {/* Status Panel */}
          <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-[2rem] flex items-center gap-5">
            <div className={clsx("p-4 rounded-2xl", status === 'DISCONNECTED' ? "bg-gray-800 text-gray-500" : "bg-emerald-900/20 text-emerald-500")}>
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">System Status</h3>
              <p className="text-xl font-bold text-white">{status === 'DISCONNECTED' ? 'DISCONNECTED' : 'MONITORING ACTIVE'}</p>
            </div>
          </div>

          {/* ALERT POPUP (Smart Logic) */}
          {status === 'CRITICAL' && !acknowledged && (
            <div className="flex-1 bg-red-600 rounded-[2rem] p-8 flex flex-col justify-center items-center text-center animate-bounce shadow-[0_0_50px_rgba(220,38,38,0.5)]">
              <AlertTriangle size={64} className="text-white mb-4" />
              <h2 className="text-3xl font-black text-white uppercase mb-2">CRITICAL ALERT</h2>
              <p className="text-red-100 font-bold mb-6">VITALS OUT OF SAFE RANGE</p>

              <button
                onClick={handleDismiss}
                className="bg-white text-red-600 px-8 py-3 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 shadow-lg"
              >
                <VolumeX size={20} />
                ACKNOWLEDGE & SILENCE
              </button>
            </div>
          )}

          {/* Acknowledged State */}
          {status === 'CRITICAL' && acknowledged && (
            <div className="flex-1 bg-red-900/20 border-2 border-red-900/50 border-dashed rounded-[2rem] p-8 flex flex-col justify-center items-center text-center">
              <VolumeX size={48} className="text-red-500 mb-2 opacity-50" />
              <h3 className="text-xl font-bold text-red-400">ALARM SILENCED</h3>
              <p className="text-red-500/60 text-sm mt-2">Monitoring continues. Alert will reset when vitals stabilize.</p>
            </div>
          )}
        </div>

        {/* Live Graph Section */}
        <div className="lg:col-span-3 bg-[#0a0a0a] border border-gray-800 p-6 rounded-[2rem] relative">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_currentColor]" />
            <span className="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase">Real-Time ECG Feed</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="heart_rate" stroke="#ef4444" strokeWidth={4} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="spo2" stroke="#06b6d4" strokeWidth={4} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
