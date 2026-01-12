import React from 'react';
import clsx from 'clsx';
import GlassPanel from './GlassPanel';
import { Activity } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const HeroHeartRate = ({ heartRate, history, status }) => {
    const isNoData = heartRate === '--' || heartRate === undefined;
    const numValue = parseInt(heartRate) || 0;

    // Dynamic Color Logic
    let colorClass = 'text-medical-green';
    let glowClass = '';
    let labelColor = 'text-medical-green';

    if (status === 'CRITICAL') {
        colorClass = 'text-medical-red animate-pulse-slow';
        glowClass = 'shadow-lg shadow-medical-red/20';
        labelColor = 'text-medical-red';
    } else if (status === 'WARNING') {
        colorClass = 'text-medical-yellow';
        glowClass = 'shadow-lg shadow-medical-yellow/20';
        labelColor = 'text-medical-yellow';
    }

    return (
        <GlassPanel className={clsx("flex items-center justify-between p-8 relative group", glowClass)}>

            {/* Background ECG Graph (Low Opacity) */}
            <div className="absolute inset-0 z-0 opacity-20 translate-y-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                        <Line type="monotone" dataKey="hr" stroke="currentColor" strokeWidth={2} dot={false} isAnimationActive={false} className={colorClass} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Left: Label & Icon */}
            <div className="flex flex-col h-full justify-between z-10 relative">
                <div className="flex items-center gap-2">
                    <Activity className={clsx("w-6 h-6", labelColor, "animate-heartbeat")} />
                    <span className={clsx("font-sans font-bold tracking-[0.2em] text-sm uppercase opacity-80", labelColor)}>
                        ECG • HR
                    </span>
                </div>
                <div className="mt-2 text-xs font-sans font-medium text-slate-400">
                    Lead II <br /> 1.0mV <br /> A-Fib
                </div>
                <div className="mt-8">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-sans font-bold">Limits</div>
                    <div className={clsx("text-lg font-sans font-bold", labelColor)}>60 - 120</div>
                </div>
            </div>

            {/* Right: Main Numeric Display */}
            <div className="relative z-10 flex items-baseline">
                {isNoData ? (
                    <span className="text-[12rem] leading-none font-sans font-bold text-slate-200">--</span>
                ) : (
                    <span className={clsx(
                        "text-[12rem] leading-none font-sans font-bold tracking-tighter tabular-nums transition-colors duration-200",
                        colorClass
                    )}>
                        {numValue}
                    </span>
                )}
                <span className={clsx("text-4xl font-sans font-bold ml-4 opacity-40 absolute -bottom-4 right-0", colorClass)}>
                    BPM
                </span>
            </div>

            {/* Status Line */}
            {status !== 'NORMAL' && (
                <div className={clsx(
                    "absolute top-0 right-0 px-4 py-1 font-bold text-xs tracking-widest uppercase bg-black/50 backdrop-blur-md border-l border-b border-white/10 rounded-bl-xl",
                    status === 'CRITICAL' ? 'text-medical-red' : 'text-medical-yellow'
                )}>
                    {status}
                </div>
            )}
        </GlassPanel>
    );
};

export default HeroHeartRate;
