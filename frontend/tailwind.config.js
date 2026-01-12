/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                tech: ['"Share Tech Mono"', 'monospace'], // The hardware look
            },
            colors: {
                'medical-green': '#10b981', // Emerald 500
                'medical-green-dim': 'rgba(16, 185, 129, 0.1)',

                'medical-cyan': '#0ea5e9', // Sky 500
                'medical-cyan-dim': 'rgba(14, 165, 233, 0.1)',

                'medical-yellow': '#f59e0b', // Amber 500
                'medical-yellow-dim': 'rgba(245, 158, 11, 0.1)',

                'medical-red': '#f43f5e', // Rose 500
                'medical-red-dim': 'rgba(244, 63, 94, 0.1)',

                'panel-bg': '#ffffff', // White
                'panel-border': '#e2e8f0', // Slate 200
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'flash-critical': 'flash 0.5s steps(2, start) infinite',
                'scan': 'scan 10s linear infinite',
                'heartbeat': 'heartbeat 1s ease-in-out infinite',
            },
            keyframes: {
                flash: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.3' },
                },
                scan: {
                    '0%': { transform: 'translateY(0%)' },
                    '100%': { transform: 'translateY(100%)' },
                },
                heartbeat: {
                    '0%, 100%': { transform: 'scale(1)', opacity: '1' },
                    '15%': { transform: 'scale(1.02)', opacity: '0.9' },
                    '30%': { transform: 'scale(1)', opacity: '1' },
                }
            },
            backdropBlur: {
                'xs': '2px',
            }
        },
    },
    plugins: [],
}
