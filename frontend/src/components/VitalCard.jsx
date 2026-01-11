import React from 'react';
import clsx from 'clsx';
import { Activity, Heart, Zap, Waves } from 'lucide-react';

const VitalCard = ({ title, value, type, isCritical }) => {
    const Icon = type === 'heart' ? Heart : (type === 'spo2' ? Waves : Zap);

    // Distinct Medical Colors - Red (Heart), Blue (SpO2)
    const borderColor = type === 'heart' ? 'border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.2)]';
    const textColor = type === 'heart' ? 'text-red-500' : 'text-cyan-400';
    const iconColor = type === 'heart' ? 'text-red-500' : 'text-cyan-500';

    return (
        <div className={clsx(
            "h-[300px] rounded-2xl border-4 flex flex-col items-center justify-center relative bg-[#0a0f16] transition-all duration-300",
            borderColor,
            isCritical && "animate-pulse border-red-600 shadow-[0_0_50px_rgba(239,68,68,0.5)]"
        )}>
            {/* Header */}
            <div className="absolute top-8 text-gray-300 font-bold tracking-widest text-lg uppercase flex items-center gap-2">
                {title}
            </div>

            {/* Main Value Center */}
            <div className="flex items-center gap-6 mt-4">
                <Icon className={clsx("w-12 h-12", iconColor, isCritical && "animate-pulse")} strokeWidth={2.5} />
                <span className={clsx(
                    "text-9xl font-sans font-bold tracking-tighter tabular-nums leading-none drop-shadow-2xl",
                    isCritical ? "text-red-500" : "text-white"
                )}>
                    {value || '--'}
                </span>
            </div>
        </div>
    );
};

export default VitalCard;
