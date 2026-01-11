```javascript
import React, { useEffect, useState, useRef } from 'react';
import socket from './services/socket';
import VitalCard from './components/VitalCard';
import AlertPopup from './components/AlertPopup';
import { 
  Activity, Wifi, WifiOff, LayoutDashboard, Users, FileText, Settings, 
  Bell, Search, Menu, User, Clock, Calendar 
} from 'lucide-react';
import clsx from 'clsx';

function App() {
  const [vitals, setVitals] = useState({ heart_rate: 0, spo2: 0, status: 'NORMAL' });
  const [alert, setAlert] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState('DISCONNECTED'); 
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Audio Ref
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sound Control (Same as before)
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
        try { oscillatorRef.current.osc.stop(); oscillatorRef.current.lfo.stop(); } catch (e) {}
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
            setAlert({ message: '⚠️ CRITICAL VITALS DETECTED', details: { hr: data.heart_rate, spo2: data.spo2 } });
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

  // UI Helpers
  const isCritical = vitals.status === 'CRITICAL';
  const isDisconnected = deviceStatus === 'DISCONNECTED';

  return (
    <div className="flex h-screen bg-[#09090b] text-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-[#1f2937] flex flex-col hidden md:flex">
        <div className="p-6 border-b border-[#1f2937] flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">VITALEYE</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
            {[
                { icon: LayoutDashboard, label: 'Dashboard', active: true },
                { icon: Users, label: 'Patients' },
                { icon: FileText, label: 'History' },
                { icon: Settings, label: 'Settings' }
            ].map((item) => (
                <div key={item.label} className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer",
                    item.active ? "bg-blue-600/10 text-blue-500 border border-blue-600/20" : "hover:bg-white/5 text-gray-400"
                )}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                </div>
            ))}
        </nav>

        <div className="p-4 border-t border-[#1f2937]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-300" />
                </div>
                <div>
                    <div className="text-sm font-bold">Dr. Staff</div>
                    <div className="text-xs text-gray-500">ICU Specialist</div>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 bg-[#09090b] -z-10" />
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#1f2937] bg-[#0a0a0a]/50 backdrop-blur-sm flex items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-4 text-gray-400">
                <Menu className="w-6 h-6 md:hidden" />
                <div className="hidden md:flex items-center gap-6 text-sm font-mono opacity-60">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{currentTime.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{currentTime.toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                    {isCritical && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />}
                </div>
                <div className={clsx(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-wide",
                    isDisconnected ? "bg-gray-800 border-gray-700 text-gray-400" : (isCritical ? "bg-red-500/10 border-red-500 text-red-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500")
                )}>
                    <span className={clsx("w-2 h-2 rounded-full", isDisconnected ? "bg-gray-500" : (isCritical ? "bg-red-500 animate-pulse" : "bg-emerald-500"))} />
                    {isDisconnected ? 'DISCONNECTED' : (isCritical ? 'CRITICAL' : 'SYSTEM ONLINE')}
                </div>
            </div>
        </header>

        {/* Dashboard Area */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
            
            <AlertPopup alert={alert} onDismiss={() => setAlert(null)} />

            {/* Patient Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-[#1f2937]">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Patient Monitor</h2>
                    <div className="flex items-center gap-4 mt-2 text-gray-400 text-sm">
                        <span className="bg-[#1f2937] px-2 py-1 rounded">ID: #8392-A</span>
                        <span>Ward <b className="text-gray-200">ICU-01</b></span>
                        <span>Bed <b className="text-gray-200">04</b></span>
                    </div>
                </div>
                <div className="flex gap-3">
                   {/* Actions/Placeholders can go here */}
                </div>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Heart Rate */}
                <VitalCard 
                    title="HEART RATE"
                    value={isDisconnected ? '--' : vitals.heart_rate}
                    unit="bpm"
                    type="heart"
                    isCritical={isCritical && !isDisconnected}
                    trend="+2%"
                />

                {/* SpO2 */}
                <VitalCard 
                    title="OXYGEN SATURATION"
                    value={isDisconnected ? '--' : vitals.spo2}
                    unit="%"
                    type="spo2"
                    isCritical={isCritical && !isDisconnected}
                    trend="Stable"
                />

                {/* Status / Quick View */}
                <div className={clsx(
                    "rounded-2xl p-6 border flex flex-col justify-center items-center text-center transition-colors duration-500",
                    isCritical 
                        ? "bg-red-500/10 border-red-500/50" 
                        : "bg-[#0a0a0a] border-[#1f2937]"
                )}>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Overall Status</div>
                    <div className={clsx(
                        "text-4xl font-black mb-2",
                        isCritical ? "text-red-500" : (isDisconnected ? "text-gray-500" : "text-emerald-500")
                    )}>
                        {isDisconnected ? "OFFLINE" : (isCritical ? "CRITICAL" : "STABLE")}
                    </div>
                    {isCritical && <div className="text-red-400 text-xs animate-pulse font-mono">⚠️ CHECK PATIENT IMMEDIATELY</div>}
                    {!isCritical && !isDisconnected && <div className="text-emerald-500/50 text-xs font-mono">ALL PARAMETERS NORMAL</div>}
                </div>

            </div>
            
            {/* Disclaimer Footer */}
            <div className="mt-12 text-center text-xs text-gray-600 font-mono">
                System Last Sync: {new Date().toLocaleTimeString()} • Failsafe Mode Active
            </div>

        </div>
      </main>
    </div>
  );
}

export default App;
```
