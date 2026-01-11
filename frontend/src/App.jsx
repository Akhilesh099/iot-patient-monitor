import React, { useEffect, useState } from 'react';
import socket from './services/socket';
import VitalCard from './components/VitalCard';
import LiveChart from './components/LiveChart';
import AlertPopup from './components/AlertPopup';
import { Activity, Wifi, WifiOff } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const [vitals, setVitals] = useState({ heart_rate: 0, spo2: 0, status: 'NORMAL' });
  const [history, setHistory] = useState([]);
  const [alert, setAlert] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState('DISCONNECTED'); // Default to disconnected until data arrives

  useEffect(() => {
    // 1. Connection Logic
    socket.on('connect', () => {
      console.log('Socket Connected');
    });

    // 2. Initial Data
    socket.on('initial_data', (data) => {
      setHistory(data);
      if (data.length > 0) {
        const latest = data[data.length - 1];
        setVitals(latest);
        setDeviceStatus('ONLINE');
      }
    });

    // 3. Live Updates (heart_rate, spo2, status)
    socket.on('vitals_update', (data) => {
      setVitals(data);
      setDeviceStatus('ONLINE'); // Data flow = Online
      setHistory(prev => {
        const newHistory = [...prev, data];
        if (newHistory.length > 50) newHistory.shift();
        return newHistory;
      });

      // Auto-clear alert if status returns to normal in the stream
      if (data.status === 'NORMAL') {
        setAlert(null);
      }
    });

    // 4. Critical Alert Event (Trigger Popup)
    socket.on('critical_alert', (data) => {
      setAlert(data);
    });

    // 5. Device Status Changes (e.g., Timeout)
    socket.on('device_status', (data) => {
      // data = { status: "DISCONNECTED" } or "ONLINE"
      setDeviceStatus(data.status);
    });

    return () => {
      socket.off('connect');
      socket.off('initial_data');
      socket.off('vitals_update');
      socket.off('critical_alert');
      socket.off('device_status');
    };
  }, []);

  const isCritical = vitals.status === 'CRITICAL';
  const isDisconnected = deviceStatus === 'DISCONNECTED';

  // Badge Logic
  const getBadgeStyles = () => {
    if (isDisconnected) return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    if (isCritical) return "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse";
    return "bg-green-500/10 text-green-500 border-green-500/20";
  };

  const getBadgeText = () => {
    if (isDisconnected) return "DISCONNECTED";
    if (isCritical) return "CRITICAL";
    return "ONLINE";
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-sans selection:bg-medical-green/30 relative overflow-hidden">

      {/* Full Screen Alert Overlay */}
      <AlertPopup alert={alert} onDismiss={() => setAlert(null)} />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">ICU MONITORING SYSTEM</h1>
              <p className="text-gray-500 text-sm font-mono tracking-wider">UNIT 01 • BED A</p>
            </div>
          </div>

          <div className={clsx(
            "flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-300",
            getBadgeStyles()
          )}>
            {isDisconnected ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
            <span className="font-bold tracking-widest text-sm">{getBadgeText()}</span>
          </div>
        </header>

        {/* Vital Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <VitalCard
            title="HEART RATE"
            value={isDisconnected ? '--' : vitals.heart_rate}
            unit="BPM"
            type="heart" // Will use Red
            isCritical={isCritical && !isDisconnected && vitals.heart_rate > 120}
          />
          <VitalCard
            title="SpO₂ %"
            value={isDisconnected ? '--' : vitals.spo2}
            unit="%"
            type="spo2" // Will use Blue
            isCritical={isCritical && !isDisconnected && vitals.spo2 < 90}
          />
        </div>

        {/* Live Graph */}
        <LiveChart data={history} />

      </div>
    </div>
  );
}

export default App;
