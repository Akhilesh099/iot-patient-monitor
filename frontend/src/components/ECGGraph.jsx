import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const ECGGraph = ({ data, status }) => {
    // Determine Color based on status
    const getStrokeColor = () => {
        if (status === 'CRITICAL') return '#f43f5e'; // Rose 500
        if (status === 'WARNING') return '#f59e0b'; // Amber 500
        return '#10b981'; // Emerald 500
    };

    return (
        <div className="w-full h-full relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <div className="absolute top-2 left-4 z-20 flex items-center gap-2">
                <span className="text-xs font-sans font-bold text-emerald-600 tracking-widest uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Lead II
                </span>
                <span className="text-[10px] text-slate-400 font-sans font-medium">25mm/s</span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <YAxis domain={['auto', 'auto']} hide />
                    <Line
                        type="monotone"
                        dataKey="hr"
                        stroke={getStrokeColor()}
                        strokeWidth={2.5}
                        dot={false}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ECGGraph;
