import React from 'react';
import clsx from 'clsx';
import { Activity, Heart } from 'lucide-react';

const VitalCard = ({ title, value, unit, type, isCritical }) => {
    const Icon = type === 'heart' ? Heart : Activity;

    return (
        <div className={clsx(
            "p-6 rounded-xl border transition-all duration-300",
            isCritical ? "bg-red-900/20 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]" : "bg-card-bg border-gray-800",
        )}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
                <Icon className={clsx(
                    "w-6 h-6",
                    type === 'heart' && "text-red-500",
                    type === 'spo2' && "text-blue-500",
                    isCritical && "animate-pulse-fast"
                )} />
            </div>

            <div className="flex items-baseline gap-2">
                <span className={clsx(
                    "text-5xl font-bold",
                    isCritical ? "text-red-500" : "text-white"
                )}>
                    {value || '--'}
                </span>
                <span className="text-gray-500 font-medium">{unit}</span>
            </div>

            <div className="mt-4 text-xs font-mono text-gray-500">
                Status: <span className={clsx(
                    "font-bold",
                    isCritical ? "text-red-400" : "text-green-500"
                )}>
                    {isCritical ? 'CRITICAL' : 'NORMAL'}
                </span>
            </div>
        </div>
    );
};

export default VitalCard;
