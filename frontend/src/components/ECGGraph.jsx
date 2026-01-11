import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const ECGGraph = ({ data, status }) => {
    // Determine Color based on status
    const getStrokeColor = () => {
        if (status === 'CRITICAL') return '#ff0000'; // alert-red
        if (status === 'WARNING') return '#ffff00'; // neon-yellow
        return '#00ff00'; // neon-green
    };

    return (
        <div className="w-full h-full relative bg-monitor-panel border border-grid-line rounded overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Scanline Overlay */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-scan pointer-events-none z-10" />

            <div className="absolute top-2 left-2 z-20 flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-neon-green tracking-widest uppercase bg-black/50 px-2 py-0.5 rounded border border-neon-green/30">
                    Lead II
                </span>
                <span className="text-[10px] text-gray-500 font-mono">25mm/s</span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <YAxis domain={['auto', 'auto']} hide />
                    <Line
                        type="monotone"
                        dataKey="hr"
                        stroke={getStrokeColor()}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        // Add glow filter effect via CSS or direct SVG props if supported well, 
                        // but Tailwind utility .text-glow works on text. 
                        // For SVG stroke, we rely on the high contrast on black.
                        className="drop-shadow-[0_0_4px_rgba(0,255,0,0.8)]"
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* Fade on right edge to simulate infinite scroll seamlessly if needed, usually direct update is fine */}
            <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10" />
        </div>
    );
};

export default ECGGraph;
