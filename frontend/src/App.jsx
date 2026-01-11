import React, { useEffect, useState, useRef } from 'react';
import socket from './services/socket';
import VitalCard from './components/VitalCard';
import LiveChart from './components/LiveChart'; // Re-import Chart
import AlertPopup from './components/AlertPopup';
import {
  Activity, LayoutDashboard, Users, FileText, Settings,
  Bell, Search, Menu, User, Calendar, ShieldAlert
} from 'lucide-react';
import clsx from 'clsx';

// Mock Patient Profile Component
const PatientProfile = () => (
  <div className="bg-[#1e293b]/50 border border-slate-800 p-6 rounded-xl flex items-center gap-6 backdrop-blur-sm">
    <div className="w-20 h-20 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600 relative">
      <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold text-2xl">JD</div>
    </div>
    <div>
      <h2 className="text-xl font-bold text-white">John Doe</h2>
      <div className="flex gap-4 mt-1 text-sm text-slate-400 font-mono">
        <span>ID: <b className="text-slate-200">#8492-BX</b></span>
        <span>AGE: <b className="text-slate-200">45</b></span>
        <span>BLOOD: <b className="text-slate-200">O+</b></span>
      </div>
      <div className="mt-3 flex gap-2">
        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded uppercase border border-blue-500/20">Admitted: 2d ago</span>
        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded uppercase border border-purple-500/20">Condition: Stable</span>
      </div>
    </div>
  </div>
);

function App() {
  const [vitals, setVitals] = useState({ heart_rate: 0, spo2: 0, status: 'NORMAL' });
  const [history, setHistory] = useState([]); // Restore history for chart
  const [alert, setAlert] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState('DISCONNECTED');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Audio Ref
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      setDeviceStatus('DISCONNECTED');
      stopAlarm();
    });

    socket.on('vitals', (data) => {
      if (data.heart_rate && data.spo2) {
        setDeviceStatus(data.status === 'CRITICAL' ? 'CRITICAL' : 'ONLINE');
        setVitals(prev => ({ ...prev, ...data }));

        // Update Chart History
        setHistory(prev => {
          const newHistory = [...prev, { ...data, timestamp: new Date().toLocaleTimeString() }];
          return newHistory.slice(-20); // Keep last 20 points
        });

        if (data.status === 'CRITICAL') {
          playAlarm();
          setAlert({ message: 'CRITICAL VITALS DETECTED', details: { hr: data.heart_rate, spo2: data.spo2 } });
        } else {
          stopAlarm();
          setAlert(null);
        }
      } else if (data.status === 'DISCONNECTED') {
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
    <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden">

      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-[#020617] border-r border-slate-800 flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
          <ShieldAlert className="w-8 h-8 text-blue-500" />
          <span className="hidden lg:block ml-3 font-bold text-xl tracking-tight text-white">VITALEYE</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { icon: LayoutDashboard, label: 'Monitor', active: true },
            { icon: Users, label: 'Patients' },
            { icon: FileText, label: 'Reports' },
            { icon: Settings, label: 'Settings' }
          ].map((item) => (
            <div key={item.label} className={clsx(
              "flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer group",
              item.active ? "bg-blue-600/10 text-blue-400 border border-blue-600/20" : "hover:bg-slate-800 text-slate-500"
            )}>
              <item.icon className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
              <span className="hidden lg:block font-medium text-sm">{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden lg:block">
              <div className="text-xs font-bold text-white">Dr. Smith</div>
              <div className="text-[10px] text-slate-500">Cardiology</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">

        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4 text-slate-400 text-sm font-mono">
            <Calendar className="w-4 h-4" />
            <span>{currentTime.toLocaleDateString()}</span>
            <span className="w-px h-4 bg-slate-700 mx-2" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              {isCritical && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />}
            </div>
            <div className={clsx(
              "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2",
              isDisconnected ? "bg-slate-800 border-slate-700 text-slate-400" : (isCritical ? "bg-red-500/10 border-red-500 text-red-500" : "bg-emerald-500/10 border-emerald-500/50 text-emerald-500")
            )}>
              <span className={clsx("w-2 h-2 rounded-full", isDisconnected ? "bg-slate-500" : (isCritical ? "bg-red-500" : "bg-emerald-500"))} />
              {isDisconnected ? 'OFFLINE' : (isCritical ? 'CRITICAL ALERT' : 'SYSTEM ONLINE')}
            </div>
          </div>
        </header>

        {/* Dashboard Canvas */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <AlertPopup alert={alert} onDismiss={() => setAlert(null)} />

          {/* Top Row: Profile + Vitals */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Patient Profile Widget */}
            <div className="xl:col-span-1">
              <PatientProfile />
              {/* Add a mini status log or something below if space permits */}
              <div className="mt-6 p-4 rounded-xl border border-slate-800 bg-[#1e293b]/30">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Recent Activity</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>SpO2 dropped to 94%</span>
                    <span className="ml-auto opacity-50">2m ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Routine check complete</span>
                    <span className="ml-auto opacity-50">15m ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vitals Widgets */}
            <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <VitalCard
                title="Heart Rate"
                value={isDisconnected ? '--' : vitals.heart_rate}
                type="heart"
                isCritical={isCritical && !isDisconnected}
              />
              <VitalCard
                title="Oxygen Level"
                value={isDisconnected ? '--' : vitals.spo2}
                type="spo2"
                isCritical={isCritical && !isDisconnected}
              />
            </div>
          </div>

          {/* Bottom Row: Live Graph */}
          <div className="w-full">
            <LiveChart data={history} />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
