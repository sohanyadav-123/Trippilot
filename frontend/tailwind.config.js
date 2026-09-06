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
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Primary commercial blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        navy: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0b1120',
        },
        surface: {
          base: '#0B1120',
          card: '#111A2E',
          elevated: '#16223B',
          hover: '#1D2C4D',
          border: '#1F2E4D',
          input: '#0E1627',
        },
        dark: {
          bg: '#0B1120',
          card: '#111A2E',
          border: '#1F2E4D',
          hover: '#1D2C4D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.35)',
        'card-hover': '0 10px 30px -4px rgba(0, 0, 0, 0.45)',
        'dropdown': '0 12px 32px -4px rgba(0, 0, 0, 0.5)',
        'brand': '0 4px 14px 0 rgba(37, 99, 235, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'dropdown': 'dropdown 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        'page-enter': 'pageEnter 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        'modal-panel': 'modalPanel 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        'modal-backdrop': 'modalBackdrop 0.2s ease-out',
        'message-enter': 'messageEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-pop': 'scalePop 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        dropdown: {
          from: { opacity: '0', transform: 'scale(0.98) translateY(-4px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        pageEnter: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        modalPanel: {
          from: { opacity: '0', transform: 'scale(0.98) translateY(4px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        modalBackdrop: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        messageEnter: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scalePop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      }
    },
  },
  plugins: [],
}
