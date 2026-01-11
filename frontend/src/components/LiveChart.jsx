import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const LiveChart = ({ data }) => {
    return (
        <div className="w-full h-[450px] bg-white/[0.02] backdrop-blur-sm rounded-3xl border border-white/5 p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <h3 className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">REAL-TIME TRENDS</h3>
                </div>
                <div className="flex gap-4 text-xs font-mono text-gray-500">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500/50"></span>HR</span>
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500/50"></span>SpO₂</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="350px">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSpo2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="timestamp" hide />
                    <YAxis
                        domain={['auto', 'auto']}
                        stroke="#666"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => Math.round(value)}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0a0a0a',
                            border: '1px solid #333',
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                        cursor={{ stroke: '#ffffff20', strokeWidth: 1 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="heart_rate"
                        stroke="#ef4444"
                        fillOpacity={1}
                        fill="url(#colorHr)"
                        strokeWidth={2}
                        isAnimationActive={false}
                    />
                    <Area
                        type="monotone"
                        dataKey="spo2"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorSpo2)"
                        strokeWidth={2}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LiveChart;
