import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';

const AlertPopup = ({ alert, onDismiss }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (alert) {
            setVisible(true);
            // Auto-dismiss or keep persistent until manual dismissal? 
            // User said "pop up! like red red red", usually implies persistent until fixed or dismissed.
        } else {
            setVisible(false);
        }
    }, [alert]);

    if (!visible || !alert) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-medical-red text-white p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-4 border-4 border-white/20 animate-pulse-fast transform scale-100">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-full">
                            <AlertTriangle className="w-12 h-12 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold uppercase tracking-wider">Critical Alert</h2>
                            <p className="text-white/90 text-lg">Immediate Attention Required</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setVisible(false)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="bg-black/20 rounded-xl p-6 mb-6">
                    <p className="text-2xl font-mono font-bold text-center">
                        {alert.message || "Abnormal Vitals Detected"}
                    </p>
                    {alert.details && (
                        <div className="mt-4 flex justify-around border-t border-white/10 pt-4">
                            <div className="text-center">
                                <div className="text-sm opacity-75">HEART RATE</div>
                                <div className="text-3xl font-bold">{alert.details.hr}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm opacity-75">SPO2</div>
                                <div className="text-3xl font-bold">{alert.details.spo2}%</div>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={onDismiss}
                    className="w-full bg-white text-medical-red font-bold py-4 rounded-xl hover:bg-gray-100 transition-colors uppercase tracking-widest text-lg shadow-lg"
                >
                    Acknowledge
                </button>
            </div>
        </div>
    );
};

export default AlertPopup;
