import React from 'react';
import clsx from 'clsx';
import { Activity, Heart, Zap } from 'lucide-react';

const VitalCard = ({ title, value, unit, type, isCritical }) => {
    const Icon = type === 'heart' ? Heart : (type === 'spo2' ? Activity : Zap);

    // Color Logic
    const baseColor = type === 'heart' ? 'text-medical-red' : 'text-medical-blue';
    const borderColor = isCritical ? 'border-red-500/50' : 'border-white/5';
    const bgStyle = isCritical ? 'bg-red-500/5' : 'bg-white/[0.02]';
    const glowClass = isCritical ? 'shadow-[0_0_30px_rgba(220,38,38,0.2)]' : 'hover:bg-white/[0.04]';

    return (
        <div className={clsx(
            "relative p-6 rounded-3xl border backdrop-blur-xl transition-all duration-500 group",
            borderColor, bgStyle, glowClass
        )}>
            {/* Critical Ping */}
            {isCritical && (
                <div className="absolute top-4 right-4 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
            )}

            <div className="flex flex-col h-full justify-between">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className={clsx("p-2.5 rounded-xl bg-white/5 border border-white/5", baseColor)}>
                        <Icon className={clsx("w-5 h-5", isCritical && "animate-pulse")} />
                    </div>
                    <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">{title}</span>
                </div>

                {/* Value */}
                <div className="flex items-baseline gap-2">
                    <span className={clsx(
                        "text-7xl font-mono font-bold tracking-tighter tabular-nums leading-none transition-colors duration-300",
                        isCritical ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "text-white"
                    )}>
                        {value || '--'}
                    </span>
                    <span className="text-lg font-medium text-gray-500 mb-2">{unit}</span>
                </div>

                {/* Footer / Mini-graph placeholder visual */}
                <div className="mt-6 h-1.5 w-full bg-gray-800/50 rounded-full overflow-hidden">
                    <div className={clsx(
                        "h-full rounded-full transition-all duration-1000",
                        isCritical ? "bg-red-500 w-full animate-pulse" : (type === 'heart' ? "bg-red-500" : "bg-blue-500")
                    )}
                        style={{ width: value && !isNaN(value) ? `${(value / (type === 'heart' ? 200 : 100)) * 100}%` : '0%' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default VitalCard;
