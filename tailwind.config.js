/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        radar: {
          bg: '#030d12',
          panel: '#071520',
          border: '#0d3a4f',
          accent: '#00e5ff',
          green: '#00ff88',
          warn: '#ffaa00',
          danger: '#ff4444',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
