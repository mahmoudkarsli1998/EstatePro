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
          DEFAULT: '#0ea5e9', // Sky 500 - Professional Blue/Cyan
          hover: '#0284c7',   // Sky 600
          light: 'rgba(14, 165, 233, 0.1)',
        },
        secondary: {
          DEFAULT: '#8b5cf6', // Violet 500
          hover: '#7c3aed',
        },
        accent: {
          DEFAULT: '#f43f5e', // Rose 500 - Muted Pink
          hover: '#e11d48',
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
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
