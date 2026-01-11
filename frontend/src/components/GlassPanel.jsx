import React from 'react';
import clsx from 'clsx';

const GlassPanel = ({ children, className, intensity = 'normal' }) => {
    return (
        <div className={clsx(
            "relative rounded-xl border transition-all duration-300 overflow-hidden backdrop-blur-xs",
            // Base Glass Effect
            "bg-panel-bg border-panel-border shadow-lg",
            // Inner Shine
            "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none",
            className
        )}>
            {/* Fine Grid Background Overlay */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMGgwdjHguIDF2LTF6IiBmaWxsPSJyZ2JhKDI1NSwgMjU1LDI1NSwgMC4xKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')]"></div>

            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};

export default GlassPanel;
