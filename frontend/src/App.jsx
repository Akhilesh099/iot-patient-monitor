import React, { useEffect, useState } from 'react';
import socket from './services/socket';
import VitalCard from './components/VitalCard';
import LiveChart from './components/LiveChart';
import AlertBanner from './components/AlertBanner';
import { Activity } from 'lucide-react';

function App() {
  const [vitals, setVitals] = useState({ heart_rate: 0, spo2: 0 });
  const [history, setHistory] = useState([]);
  const [alert, setAlert] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [deviceConnected, setDeviceConnected] = useState(true);

  useEffect(() => {
    // Socket Connection Logic
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('initial_data', (data) => {
      setHistory(data);
      if (data.length > 0) {
        setVitals(data[data.length - 1]);
      }
    });

    socket.on('vitals_update', (data) => {
      setVitals(data);
      setDeviceConnected(true); // Received data means device is alive
      setHistory(prev => {
        const newHistory = [...prev, data];
        if (newHistory.length > 50) newHistory.shift(); // Keep buffer small
        return newHistory;
      });
    });

    socket.on('alert_triggered', (data) => {
      setAlert(data);
      // Play sound or vibrate logic here
    });

    socket.on('alert_cleared', () => {
      setAlert(null);
    });

    socket.on('device_disconnected', () => {
      setDeviceConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('vitals_update');
      socket.off('alert_triggered');
      socket.off('alert_cleared');
      socket.off('device_disconnected');
    };
  }, []);

  const isHrCritical = vitals.heart_rate > 120;
  const isSpo2Critical = vitals.spo2 < 90;

  return (
    <div className="min-h-screen bg-dark-bg p-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-medical-green/10 p-2 rounded-lg">
            <Activity className="text-medical-green w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MediSense IoT Monitor</h1>
            <p className="text-gray-500 text-sm">Design Project Demo</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isConnected ? (
            <span className="flex items-center gap-2 text-xs font-mono text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              SYSTEM ONLINE
            </span>
          ) : (
            <span className="text-red-500 text-xs font-mono">SYSTEM OFFLINE</span>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <AlertBanner alert={alert} isDisconnected={!deviceConnected} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <VitalCard
            title="Heart Rate"
            value={vitals.heart_rate}
            unit="BPM"
            type="heart"
            isCritical={isHrCritical}
          />
          <VitalCard
            title="SpO₂ Saturation"
            value={vitals.spo2}
            unit="%"
            type="spo2"
            isCritical={isSpo2Critical}
          />
        </div>

        <LiveChart data={history} />
      </main>
    </div>
  );
}

export default App;
