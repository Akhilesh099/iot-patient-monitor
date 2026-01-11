import React, { useEffect, useState, useRef } from 'react';
import socket from './services/socket';
import VitalCard from './components/VitalCard';
import AlertPopup from './components/AlertPopup';
import { Activity, Wifi, WifiOff, Volume2, ShieldAlert } from 'lucide-react';
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

    if (oscillatorRef.current) return; // Already playing

    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, audioContextRef.current.currentTime + 0.1);

    gain.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);

    // Beep-beep pattern
    const now = audioContextRef.current.currentTime;
    // Simple continuous pulsing beep logic is harder with single oscillator node, 
    // better to use interval in useEffect but browser policies block generic playback.
    // Instead relying on basic "on/off" or just one continuous low-high tone.
    // Let's do a siren effect.

    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);
    osc.start();

    // Siren LFO
    const lfo = audioContextRef.current.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 2; // 2Hz siren
    const lfoGain = audioContextRef.current.createGain();
    lfoGain.gain.value = 200; // Modulate by 200Hz
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();

    oscillatorRef.current = { osc, lfo };
  };

  const stopAlarm = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.osc.stop();
        oscillatorRef.current.lfo.stop();
      } catch (e) { /* ignore */ }
      oscillatorRef.current = null;
    }
  };

  useEffect(() => {
    // Socket Setup
    socket.on('connect', () => console.log('Socket Connected'));
    socket.on('disconnect', () => {
      setDeviceConnected(false);
      setDeviceStatus('DISCONNECTED');
      stopAlarm();
    });

    socket.on('vitals', (data) => {
      console.log("LIVE DATA:", data);

      if (data.heart_rate && data.spo2) {
        setDeviceConnected(true);
        const newStatus = data.status || 'NORMAL';
        setDeviceStatus(newStatus === 'CRITICAL' ? 'CRITICAL' : 'ONLINE');
        setVitals(prev => ({ ...prev, ...data, status: newStatus }));

        if (newStatus === 'CRITICAL') {
          playAlarm(); // Trigger Sound
          setAlert({
            message: '⚠️ CRITICAL VITALS DETECTED',
            details: { hr: data.heart_rate, spo2: data.spo2 }
          });
        } else {
          stopAlarm(); // Stop Sound
          setAlert(null);
        }
      } else if (data.status === 'DISCONNECTED') {
        setDeviceConnected(false);
        setDeviceStatus('DISCONNECTED');
        stopAlarm();
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('vitals');
      stopAlarm();
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
    <div className="min-h-screen bg-[#020408] text-white p-4 md:p-8 font-sans relative overflow-hidden flex flex-col items-center justify-center">

      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#020408] to-[#020408] pointer-events-none" />

      {/* Emergency Alert Banner */}
      {isCritical && (
        <div className="fixed top-0 inset-x-0 bg-red-600/90 text-white py-3 text-center font-bold tracking-widest animate-pulse z-50 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
          EMERGENCY ALERT: PATIENT VITALS UNSTABLE! CHECK IMMEDIATELY!
        </div>
      )}

      <AlertPopup alert={alert} onDismiss={() => setAlert(null)} />

      <div className="max-w-6xl w-full space-y-12 relative z-10">

        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <ShieldAlert className="w-10 h-10 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">ICU VITALEYE</h1>
              <p className="text-gray-500 text-sm font-mono tracking-[0.2em] uppercase mt-1">Unit 01 • Bed A</p>
            </div>
          </div>

          <div className={clsx(
            "flex items-center gap-4 px-8 py-4 rounded-xl border backdrop-blur-md transition-all duration-300",
            isDisconnected ? "bg-red-500/10 border-red-500/50 text-red-500" : (isCritical ? "bg-red-600 text-white animate-pulse" : "bg-green-500/10 border-green-500/30 text-green-400")
          )}>
            {isDisconnected ? <WifiOff className="w-6 h-6" /> : <Wifi className="w-6 h-6" />}
            <div className="text-right">
              <div className="text-xs uppercase opacity-70 font-semibold tracking-wider">Device Status</div>
              <div className="font-bold tracking-widest text-lg">
                {isDisconnected ? "DISCONNECTED" : (isCritical ? "CRITICAL" : "ONLINE")}
              </div>
            </div>
          </div>
        </header>

        {/* Vital Cards Container - Centered and Big */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch pt-8">
          {/* Heart Rate */}
          <VitalCard
            title="HEART RATE (BPM)"
            value={isDisconnected ? '--' : vitals.heart_rate}
            unit=""
            type="heart"
            isCritical={isCritical && !isDisconnected}
          />

          {/* SpO2 */}
          <VitalCard
            title="SPO₂ (%)"
            value={isDisconnected ? '--' : vitals.spo2}
            unit=""
            type="spo2"
            isCritical={isCritical && !isDisconnected}
          />

          {/* Status Card - New addition to match image's 3-panel look essentially */}
          <div className={clsx(
            "p-8 rounded-3xl border backdrop-blur-xl flex flex-col items-center justify-center text-center transition-all duration-500",
            isCritical
              ? "bg-red-500 text-white border-red-400 shadow-[0_0_50px_rgba(220,38,38,0.4)]"
              : (isDisconnected ? "bg-gray-800/50 border-gray-700 text-gray-400" : "bg-green-500/10 border-green-500/30 text-green-400")
          )}>
            <h3 className="text-sm font-bold tracking-[0.3em] uppercase mb-4 opacity-80">PATIENT STATUS</h3>
            <div className="text-5xl font-black tracking-tight mb-2">
              {isDisconnected ? "NO DATA" : (isCritical ? "CRITICAL" : "STABLE")}
            </div>
            <div className="text-sm font-mono opacity-70 uppercase tracking-widest">
              {isCritical ? "Automatic Alert Sent" : (isDisconnected ? "Check Connection" : "Monitoring Active")}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
