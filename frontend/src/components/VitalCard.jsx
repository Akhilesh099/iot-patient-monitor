import React from 'react';
import clsx from 'clsx';
import { Activity, Heart, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const VitalCard = ({ title, value, unit, type, isCritical, trend }) => {
    const Icon = type === 'heart' ? Heart : (type === 'spo2' ? Activity : Zap);

    // Crisp Colors suitable for medical apps
    const accentColor = type === 'heart' ? 'text-rose-500' : 'text-sky-500';
    const borderColor = isCritical ? 'border-red-600' : 'border-gray-800';
    const bgClass = isCritical ? 'bg-red-950/20' : 'bg-[#0e0e0e]';

    return (
        <div className={clsx(
            "relative p-6 rounded-2xl border transition-all duration-300 group hover:border-gray-700",
            borderColor, bgClass
        )}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={clsx("p-2 rounded-lg bg-gray-900 border border-gray-800", accentColor)}>
                        <Icon className={clsx("w-5 h-5", isCritical && "animate-pulse")} />
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-gray-500 tracking-wider uppercase">{title}</span>
                        <span className="text-[10px] text-gray-600">Real-time Sensor A</span>
                    </div>
                </div>
                {/* Visual Trend Indicator (Mock logic for visual punch) */}
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                    <TrendingUp className="w-3 h-3" />
                    <span>Normal</span>
                </div>
            </div>

            {/* Main Value */}
            <div className="flex items-baseline gap-3 mt-4">
                <span className={clsx(
                    "text-6xl font-sans font-bold tracking-tight tabular-nums",
                    isCritical ? "text-red-500" : "text-white"
                )}>
                    {value || '--'}
                </span>
                <span className="text-lg text-gray-500 font-medium">{unit}</span>
            </div>

            {/* Footer / Range Bar */}
            <div className="mt-6">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-mono uppercase">
                    <span>Low</span>
                    <span>Range</span>
                    <span>High</span>
                </div>
                <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                    <div className={clsx(
                        "h-full rounded-full transition-all duration-1000",
                        isCritical ? "bg-red-500 animate-pulse" : (type === 'heart' ? "bg-rose-500" : "bg-sky-500")
                    )}
                        style={{ width: value && !isNaN(value) ? `${(value / (type === 'heart' ? 200 : 100)) * 100}%` : '0%' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default VitalCard;
