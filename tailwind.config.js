/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        steel: {
          50: "#F4F5F6",
          100: "#E8E6E1",
          200: "#C8CCD1",
          300: "#8B95A1",
          400: "#5A6470",
          500: "#3A4047",
          600: "#2D3338",
          700: "#22272C",
          800: "#1A1D21",
          900: "#15181B",
          950: "#0D0F11",
        },
        safety: {
          50: "#FFF8E8",
          100: "#FFEFC2",
          200: "#FFE08A",
          300: "#FFCC4D",
          400: "#F5A623",
          500: "#E0900A",
          600: "#B8730A",
          700: "#8C5608",
          800: "#5C3905",
        },
        engine: {
          400: "#FF8C42",
          500: "#FF6B1A",
          600: "#E0500A",
        },
        rust: {
          200: "#D4CFC4",
          300: "#B8B0A0",
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      boxShadow: {
        'key': '4px 4px 0 0 rgba(0,0,0,0.4)',
        'key-sm': '2px 2px 0 0 rgba(0,0,0,0.3)',
        'key-yellow': '4px 4px 0 0 #B8730A',
        'inset-line': 'inset 0 -2px 0 0 rgba(0,0,0,0.2)',
      },
      backgroundImage: {
        'grid-lines': 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        'hazard-stripes': 'repeating-linear-gradient(45deg, #F5A623, #F5A623 10px, #1A1D21 10px, #1A1D21 20px)',
        'perforated': 'radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-32': '32px 32px',
        'perforated-8': '8px 8px',
      },
      animation: {
        'slide-in': 'slideIn 0.4s ease-out',
        'flash': 'flash 1.5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        flash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245,166,35,0.4)' },
          '50%': { boxShadow: '0 0 0 6px rgba(245,166,35,0)' },
        },
      },
    },
  },
  plugins: [],
};
