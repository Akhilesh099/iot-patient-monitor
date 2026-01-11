import React from 'react';
import { AlertTriangle, WifiOff } from 'lucide-react';
import clsx from 'clsx';

const AlertBanner = ({ alert, isDisconnected }) => {
    if (isDisconnected) {
        return (
            <div className="bg-orange-500/10 border border-orange-500 text-orange-500 px-6 py-4 rounded-xl flex items-center gap-3 animate-pulse mb-6">
                <WifiOff className="w-6 h-6" />
                <span className="font-bold text-lg">DEVICE DISCONNECTED</span>
            </div>
        );
    }

    if (!alert) return null;

    return (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-xl flex items-center gap-3 animate-pulse mb-6">
            <AlertTriangle className="w-6 h-6" />
            <div>
                <h4 className="font-bold text-lg">CRITICAL ALERT</h4>
                <p className="text-sm text-red-400">{alert.message}</p>
            </div>
        </div>
    );
};

export default AlertBanner;
