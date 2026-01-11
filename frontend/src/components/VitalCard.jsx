import React from 'react';
import clsx from 'clsx';
import { Activity, Droplets } from 'lucide-react';

const VitalCard = ({ label, value, unit, status, limits, icon }) => {
    const isNoData = value === '--' || value === undefined || value === null;

    // Status Color Logic
    const getColorClasses = () => {
        switch (status) {
            case 'CRITICAL':
                return 'text-alert-red border-alert-red bg-alert-red/10 animate-pulse-fast';
            case 'WARNING':
                return 'text-neon-yellow border-neon-yellow bg-neon-yellow/10';
            case 'NORMAL':
            default:
                if (label === 'SpO2' || label === 'SpO₂') return 'text-neon-cyan border-neon-cyan bg-neon-cyan/5';
                return 'text-neon-green border-neon-green bg-neon-green/5';
        }
    };

    return (
        <div className={clsx(
            "relative border-2 rounded-lg p-4 flex flex-col justify-between h-full transition-all duration-300 overflow-hidden",
            getColorClasses()
        )}>
            {/* Background Grid Pattern (Subtle) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start z-10">
                <span className="text-sm font-bold tracking-widest opacity-80 uppercase">{label}</span>
                {icon && <div className={clsx("opacity-80", status === 'CRITICAL' && "animate-bounce")}>{icon}</div>}
            </div>

            {/* Main Value */}
            <div className="flex-1 flex items-center justify-center py-2 z-10">
                {isNoData ? (
                    <div className="flex items-end gap-1">
                        <span className="w-3 h-3 bg-current animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-3 h-3 bg-current animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-3 h-3 bg-current animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                ) : (
                    <span className="text-[9em] leading-none font-bold font-digital tracking-tighter text-glow-lg transition-all duration-150 tabular-nums">
                        {value}
                    </span>
                )}
            </div>

            {/* Footer / Details */}
            <div className="flex justify-between items-end z-10">
                <span className="text-3xl font-bold opacity-60 font-mono lower">{unit}</span>
                <div className="text-right font-mono text-xs">
                    <div className="opacity-50 uppercase tracking-wider mb-0.5">Limits</div>
                    <div className="font-bold text-lg leading-none border-t border-current pt-1">{limits}</div>
                </div>
            </div>
        </div>
    );
};

export default VitalCard;
