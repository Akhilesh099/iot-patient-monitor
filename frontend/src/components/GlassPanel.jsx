import React from 'react';
import clsx from 'clsx';

const GlassPanel = ({ children, className, intensity = 'normal' }) => {
    return (
        <div className={clsx(
            "relative rounded-2xl border transition-all duration-300 overflow-hidden",
            // Base Card Style (Light Mode)
            "bg-white border-slate-200 shadow-md",
            className
        )}>
            {/* Clean White Card - No Overlays */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};

export default GlassPanel;
