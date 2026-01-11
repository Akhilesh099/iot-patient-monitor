```
import React from 'react';
import clsx from 'clsx';
import { Activity, Heart, Zap, Waves, TrendingUp, TrendingDown, Clock } from 'lucide-react';

const VitalCard = ({ title, value, type, isCritical }) => {
    const Icon = type === 'heart' ? Heart : (type === 'spo2' ? Waves : Zap);
    
    // Theme Colors
    const theme = type === 'heart' 
        ? { text: 'text-rose-500', border: 'border-rose-500/20', bg: 'bg-rose-500/5', shadow: 'shadow-rose-900/20' }
        : { text: 'text-sky-400', border: 'border-sky-500/20', bg: 'bg-sky-500/5', shadow: 'shadow-sky-900/20' };

    const borderColor = isCritical ? 'border-red-500 animate-pulse' : 'border-slate-800';
    const bgColor = isCritical ? 'bg-red-950/30' : 'bg-[#1e293b]/50';

    return (
        <div className={clsx(
            "relative p-5 rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:border-slate-600",
            borderColor, bgColor
        )}>
            {/* Background Decor */}
            <div className={clsx("absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none", theme.bg.replace('/5', '/30'))} />

            {/* Header */}
            <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-3">
                    <div className={clsx("p-2 rounded-lg bg-slate-900/50 border border-slate-700/50", theme.text)}>
                        <Icon className={clsx("w-5 h-5", isCritical && "animate-pulse")} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">{title}</h3>
                        <p className="text-[10px] text-slate-500 font-mono">SENSOR A-1</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                    <TrendingUp className="w-3 h-3" />
                    <span>NORMAL</span>
                </div>
            </div>

            {/* Main Value */}
            <div className="flex items-baseline gap-2 mt-4 z-10">
                <span className={clsx(
                    "text-5xl font-bold tracking-tighter tabular-nums",
                    isCritical ? "text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" : "text-white"
                )}>
                    {value || '--'}
                </span>
                <span className="text-sm font-medium text-slate-500 uppercase">{type === 'heart' ? 'bpm' : '%'}</span>
            </div>

            {/* Mini Sparkline Visualization (CSS Bars) */}
            <div className="flex items-center gap-1 h-8 mt-4 opacity-50">
                {[40, 60, 45, 70, 50, 80, 65, 55, 75, 60].map((h, i) => (
                    <div key={i} 
                         className={clsx("flex-1 rounded-full transition-all duration-500", theme.bg.replace('/5', ''))}
                         style={{ height: `${ h }% ` }} 
                    />
                ))}
            </div>

            {/* Footer Meta */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Updated 1s ago</span>
                </div>
                <div className="flex gap-3">
                    <span>MIN: <b className="text-slate-300">{type === 'heart' ? '60' : '95'}</b></span>
                    <span>MAX: <b className="text-slate-300">{type === 'heart' ? '100' : '100'}</b></span>
                </div>
            </div>
        </div>
    );
};

export default VitalCard;
```
