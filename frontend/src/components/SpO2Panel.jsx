import React from 'react';
import clsx from 'clsx';
import GlassPanel from './GlassPanel';
import { Droplets } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const SpO2Panel = ({ spo2, history, status }) => {
    const isNoData = spo2 === '--' || spo2 === undefined;
    const numValue = parseInt(spo2) || 0;

    // Color logic
    let colorClass = 'text-medical-cyan';
    let barColor = 'bg-medical-cyan';
    let statusClass = 'NORMAL';

    if (numValue < 90 && !isNoData) {
        colorClass = 'text-medical-red animate-pulse';
        barColor = 'bg-medical-red';
        statusClass = 'CRITICAL';
    } else if (numValue < 95 && !isNoData) {
        colorClass = 'text-medical-yellow';
        barColor = 'bg-medical-yellow';
        statusClass = 'WARNING';
    }

    return (
        <GlassPanel className="flex flex-col p-6 h-full relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start z-10 mb-4">
                <div className="flex items-center gap-2">
                    <Droplets className={clsx("w-5 h-5", colorClass)} />
                    <span className={clsx("font-sans font-bold tracking-[0.2em] text-xs uppercase opacity-80", colorClass)}>
                        SpO₂ %
                    </span>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-sans font-bold">Limits</div>
                    <div className={clsx("text-sm font-sans font-bold", colorClass)}>90 - 100</div>
                </div>
            </div>

            {/* Main Value & Bar */}
            <div className="flex items-center justify-between z-10 flex-1">
                <div className="relative">
                    {isNoData ? (
                        <span className="text-[6rem] leading-none font-sans font-bold text-slate-200">--</span>
                    ) : (
                        <span className={clsx(
                            "text-[6rem] leading-none font-sans font-bold tracking-tighter tabular-nums",
                            colorClass
                        )}>
                            {numValue}
                        </span>
                    )}
                </div>

                {/* Saturation Bar Indicator */}
                <div className="h-32 w-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative mx-4 shadow-inner">
                    <div
                        className={clsx("absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out", barColor)}
                        style={{ height: `${isNoData ? 0 : numValue}%`, opacity: 1 }}
                    />
                    {/* Safe Zone Marker */}
                    <div className="absolute top-[10%] left-0 right-0 h-[10%] bg-emerald-500/10 pointer-events-none" />
                </div>
            </div>

            {/* Mini Pleth Waveform (Area Chart) at bottom */}
            <div className="h-16 mt-4 opacity-50 z-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                        <defs>
                            <linearGradient id="colorSpO2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={statusClass === 'CRITICAL' ? '#ff003c' : '#00f3ff'} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={statusClass === 'CRITICAL' ? '#ff003c' : '#00f3ff'} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="spo2"
                            stroke={statusClass === 'CRITICAL' ? '#ff003c' : '#00f3ff'}
                            fillOpacity={1}
                            fill="url(#colorSpO2)"
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

        </GlassPanel>
    );
};

export default SpO2Panel;
