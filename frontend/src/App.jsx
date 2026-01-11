import React, { useEffect, useState, useRef } from 'react';
import socket from './services/socket';
import VitalCard from './components/VitalCard';
import AlertPopup from './components/AlertPopup';
import { Activity, Wifi, WifiOff, ShieldAlert, Heart, Zap } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const [vitals, setVitals] = useState({ heart_rate: 0, spo2: 0, status: 'NORMAL' });
  const [alert, setAlert] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState('DISCONNECTED');
  const [deviceConnected, setDeviceConnected] = useState(false);

  // Audio Ref
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);

  // Sound Control
  const playAlarm = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (oscillatorRef.current) return;

    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, audioContextRef.current.currentTime + 0.1);
    gain.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);
    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);
    osc.start();

    // Siren LFO
    const lfo = audioContextRef.current.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 2;
    const lfoGain = audioContextRef.current.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();
    oscillatorRef.current = { osc, lfo };
  };

  const stopAlarm = () => {
    if (oscillatorRef.current) {
      try { oscillatorRef.current.osc.stop(); oscillatorRef.current.lfo.stop(); } catch (e) { }
      oscillatorRef.current = null;
    }
  };

  useEffect(() => {
    socket.on('connect', () => console.log('Connected'));
    socket.on('disconnect', () => {
      setDeviceConnected(false);
      setDeviceStatus('DISCONNECTED');
      stopAlarm();
    });

    socket.on('vitals', (data) => {
      if (data.heart_rate && data.spo2) {
        setDeviceConnected(true);
        const newStatus = data.status || 'NORMAL';
        setDeviceStatus(newStatus === 'CRITICAL' ? 'CRITICAL' : 'ONLINE');
        setVitals(prev => ({ ...prev, ...data, status: newStatus }));

        if (newStatus === 'CRITICAL') {
          playAlarm();
          setAlert({ message: 'CRITICAL VITALS DETECTED', details: { hr: data.heart_rate, spo2: data.spo2 } });
        } else {
          stopAlarm();
          setAlert(null);
        }
      } else if (data.status === 'DISCONNECTED') {
        setDeviceConnected(false);
        setDeviceStatus('DISCONNECTED');
        stopAlarm();
      }
    });

    return () => {
      socket.off('connect'); socket.off('disconnect'); socket.off('vitals'); stopAlarm();
    };
  }, []);

  const isCritical = vitals.status === 'CRITICAL';
  const isDisconnected = deviceStatus === 'DISCONNECTED';

  // Resume Audio Context on interaction
  useEffect(() => {
    const handleUserGesture = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };
    window.addEventListener('click', handleUserGesture);
    return () => window.removeEventListener('click', handleUserGesture);
  }, []);


  return (
    <div className="min-h-screen bg-[#050b14] text-white font-sans overflow-hidden flex flex-col">

      {/* Top Header - Matches Image */}
      <header className="h-20 bg-[#020408] border-b border-[#1f2937] px-8 flex items-center justify-between relative shadow-lg">

        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-white" />
          <span className="text-2xl font-bold tracking-tight text-white">ICU VITALEYE</span>
        </div>

        {/* Center: Emergency Alert Banner (Only Visible if Critical) */}
        {isCritical && (
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-red-600 px-8 py-2 rounded-lg animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.6)]">
            <span className="text-xl">🚨</span>
            <span className="font-bold tracking-wider uppercase">EMERGENCY ALERT: Patient Vitals Unstable! Check Immediately!</span>
            <span className="text-xl">🚨</span>
          </div>
        )}

        {/* Right: Device Status */}
        <div className="flex items-center gap-3">
          <div className={clsx(
            "w-4 h-4 rounded-full shadow-[0_0_10px_currentColor]",
            isDisconnected ? "bg-gray-500 text-gray-500" : (isCritical ? "bg-red-500 text-red-500 animate-ping" : "bg-green-500 text-green-500")
          )} />
          <span className="font-mono text-sm tracking-widest text-[#8899ac] uppercase">
            DEVICE {isDisconnected ? 'OFFLINE' : 'ONLINE'}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-8 relative">
        <AlertPopup alert={alert} onDismiss={() => setAlert(null)} />

        {/* Grid Container */}
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Heart Rate Card */}
          <VitalCard
            title="HEART RATE (BPM)"
            value={isDisconnected ? '--' : vitals.heart_rate}
            type="heart"
            isCritical={isCritical && !isDisconnected}
          />

          {/* SpO2 Card */}
          <VitalCard
            title="SpO₂ (%)"
            value={isDisconnected ? '--' : vitals.spo2}
            type="spo2"
            isCritical={isCritical && !isDisconnected}
          />

          {/* Status Card (Custom for exact match) */}
          <div className={clsx(
            "h-[300px] rounded-2xl border-4 flex flex-col items-center justify-center text-center bg-[#0a0f16] shadow-2xl transition-colors duration-300",
            isCritical ? "border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.2)]" : "border-gray-800"
          )}>
            <h3 className="text-gray-400 font-bold tracking-widest uppercase mb-4 text-lg">STATUS</h3>
            <div className={clsx(
              "text-6xl font-black tracking-tighter mb-4",
              isCritical ? "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" : (isDisconnected ? "text-gray-500" : "text-emerald-500")
            )}>
              {isDisconnected ? "OFFLINE" : (isCritical ? "CRITICAL" : "NORMAL")}
            </div>
            <div className="text-sm font-mono text-gray-500 uppercase tracking-widest">
              {isCritical ? "Automatic Alert" : "Monitoring Active"}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
