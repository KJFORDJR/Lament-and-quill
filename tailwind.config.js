/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark Neo-Gothic Tech Noir color scheme
        'gothic': {
          'black': '#0a0a0a',
          'charcoal': '#1a1a1a',
          'dark-gray': '#2a2a2a',
          'red': '#8b0000',
          'crimson': '#dc143c',
          'blood': '#660000',
          'silver': '#c0c0c0',
          'platinum': '#e5e4e2',
          'steel': '#708090',
          'green': '#228b22',
          'forest': '#355e3b',
        }
      },
      fontFamily: {
        'gothic': ['Cinzel', 'serif'],
        'tech': ['Orbitron', 'monospace'],
        'noir': ['Crimson Text', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'tech-grid': "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjEyMTIxIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        glow: {
          from: { boxShadow: '0 0 5px #dc143c, 0 0 10px #dc143c, 0 0 15px #dc143c' },
          to: { boxShadow: '0 0 20px #dc143c, 0 0 30px #dc143c, 0 0 40px #dc143c' },
        },
      },
    },
  },
  plugins: [],
}
