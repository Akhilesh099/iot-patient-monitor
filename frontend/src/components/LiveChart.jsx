import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const LiveChart = ({ data }) => {
    return (
        <div className="w-full h-[400px] bg-card-bg rounded-xl border border-gray-800 p-4">
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Real-time Trends</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} stroke="#666" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="heart_rate"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="spo2"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LiveChart;
