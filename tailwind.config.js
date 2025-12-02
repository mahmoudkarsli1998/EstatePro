/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00F0FF', // Neon Cyan
          hover: '#00C0CC',
          light: 'rgba(0, 240, 255, 0.1)',
        },
        secondary: {
          DEFAULT: '#8B5CF6', // Violet 500 - Much more readable than #7000FF
          hover: '#7C3AED',
        },
        accent: {
          DEFAULT: '#FF0055', // Neon Pink
          hover: '#cc0044',
        },
        dark: {
          bg: 'var(--bg-primary)',
          card: 'var(--bg-card)',
          border: 'var(--border-color)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        heading: ['"Space Grotesk"', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'liquid': 'liquid 10s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 25px rgba(0, 240, 255, 0.4)' },
          '50%': { opacity: .7, boxShadow: '0 0 10px rgba(0, 240, 255, 0.1)' },
        },
        liquid: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        }
      }
    },
  },
  plugins: [],
}
