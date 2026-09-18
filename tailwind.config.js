/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ostra Brand Kit Colors
        ostra: {
          sandstone: '#E8DCC4',
          charcoal: '#0B0F0F',
          moss: '#00A678',
          gold: '#D4AF7C',
          goldLight: '#E8CA9B',
          goldDark: '#A88048',
        },
        sandstone: {
          DEFAULT: '#E8DCC4',
          50: '#FDFCFB',
          100: '#FAF8F5',
          200: '#F5F2EB',
          300: '#EAE5DB',
          400: '#DDD6C7',
          500: '#C7BDAB',
        },
        charcoal: {
          DEFAULT: '#0B0F0F',
          950: '#060808',
          900: '#0B0F0F',
          800: '#151919',
          700: '#222728',
          600: '#3A4143',
          500: '#555E61',
          400: '#758084',
          300: '#A4AFB3',
          200: '#D2D9DC',
          100: '#EEF2F4',
        },
        ostraMoss: {
          DEFAULT: '#00A678',
          400: '#1EC695',
          500: '#00A678',
          600: '#008560',
        },
        osterdGold: {
          300: '#E8CA9B',
          400: '#DDBB86',
          500: '#D4AF7C',
          600: '#B89258',
          700: '#8E6B2C',
        },
        borderLight: '#EAE6DD',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Sora', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Sora', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'dashboard-3d': '0 30px 60px -15px rgba(24, 24, 27, 0.12), 0 10px 25px -5px rgba(24, 24, 27, 0.08), 0 0 1px 1px rgba(24, 24, 27, 0.05)',
        'card-glow': '0 10px 30px -5px rgba(197, 158, 95, 0.15)',
        'card-3d': '0 20px 40px -15px rgba(11, 15, 15, 0.08), 0 0 0 1px rgba(234, 229, 220, 0.9), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card-3d-hover': '0 30px 60px -15px rgba(11, 15, 15, 0.14), 0 0 0 1px rgba(212, 175, 124, 0.6), 0 10px 20px -5px rgba(212, 175, 124, 0.2)',
        'subtle': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
      },
    },
  },
  plugins: [],
}
