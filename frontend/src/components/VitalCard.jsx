import React from 'react';
import clsx from 'clsx';
import { Activity, Heart } from 'lucide-react';

const VitalCard = ({ title, value, unit, type, isCritical }) => {
    const Icon = type === 'heart' ? Heart : Activity;

    return (
        <div className={clsx(
            "relative overflow-hidden p-6 rounded-2xl border transition-all duration-300",
            isCritical
                ? "bg-red-500/10 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]"
                : "bg-card-bg border-white/5 hover:border-white/10"
        )}>
            {/* Background Pulse Effect for Critical */}
            {isCritical && (
                <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
            )}

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            "p-2 rounded-lg",
                            isCritical ? "bg-red-500 text-white" : "bg-[#2A2A2A] text-gray-400"
                        )}>
                            <Icon className={clsx(
                                "w-6 h-6",
                                isCritical && "animate-pulse"
                            )} />
                        </div>
                        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest">{title}</h3>
                    </div>
                    {isCritical && (
                        <span className="flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                </div>

                <div className="flex items-end gap-3 mb-4">
                    <span className={clsx(
                        "text-7xl font-bold tracking-tighter tabular-nums leading-none",
                        isCritical ? "text-red-500" : "text-white"
                    )}>
                        {value || '--'}
                    </span>
                    <span className="text-gray-500 font-medium text-xl mb-1">{unit}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="text-xs font-mono text-gray-500 uppercase">Status</div>
                    <div className={clsx(
                        "px-3 py-1 rounded-full text-xs font-bold tracking-wider",
                        isCritical ? "bg-red-500 text-white animate-pulse" : "bg-green-500/10 text-green-500"
                    )}>
                        {isCritical ? 'CRITICAL - DANGER' : 'NORMAL'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VitalCard;
