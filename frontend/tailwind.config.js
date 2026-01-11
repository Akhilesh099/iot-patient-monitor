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
                'medical-green': '#00ff41', // Matrix/Medical Green
                'medical-green-dim': 'rgba(0, 255, 65, 0.1)',

                'medical-cyan': '#00f3ff', // Sci-Fi Cyan
                'medical-cyan-dim': 'rgba(0, 243, 255, 0.1)',

                'medical-yellow': '#ffdb00', // Warning Yellow
                'medical-yellow-dim': 'rgba(255, 219, 0, 0.1)',

                'medical-red': '#ff003c', // Emergency Red
                'medical-red-dim': 'rgba(255, 0, 60, 0.1)',

                'panel-bg': 'rgba(10, 10, 12, 0.65)', // Glass panel background
                'panel-border': 'rgba(255, 255, 255, 0.08)',
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
