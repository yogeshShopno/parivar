/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f3ff',
          100: '#e1e7ff',
          200: '#c5d0ff',
          300: '#99aeff',
          400: '#647eff',
          500: '#3b52f6', // Indigo Accent
          600: '#2535e8',
          700: '#1d23d3',
          800: '#1c1fb5',
          900: '#1b2090',
        },
        slate: {
          850: '#172033',
          950: '#0b0f19',
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.45)',
          darkBg: 'rgba(15, 23, 42, 0.45)',
          border: 'rgba(255, 255, 255, 0.2)',
          darkBorder: 'rgba(255, 255, 255, 0.05)',
        }
      },
      boxShadow: {
        'glass-sm': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'glass-md': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glass-lg': '0 12px 40px 0 rgba(31, 38, 135, 0.15)',
        'glow-primary': '0 0 15px rgba(59, 82, 246, 0.35)',
        'glow-success': '0 0 15px rgba(16, 185, 129, 0.35)',
        'glow-danger': '0 0 15px rgba(239, 68, 68, 0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
