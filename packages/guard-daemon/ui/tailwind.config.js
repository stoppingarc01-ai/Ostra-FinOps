/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sandstone: {
          50: '#FDFCFB',
          100: '#FAF8F5',
          200: '#F5F2EB',
          300: '#EAE5DB',
          400: '#DDD6C7',
          500: '#C7BDAB',
        },
        charcoal: {
          900: '#141416',
          800: '#18181B',
          700: '#27272A',
          600: '#3F3F46',
          500: '#52525B',
          400: '#71717A',
          300: '#A1A1AA',
          200: '#E4E4E7',
          100: '#F4F4F5',
        },
        osterdGold: {
          300: '#E6CF9B',
          400: '#D5B676',
          500: '#C59E5F',
          600: '#B08848',
          700: '#8E6B2C',
        },
        forest: {
          950: '#071510',
          900: '#0C1E17',
          850: '#12271E',
          800: '#183428',
          700: '#224B3A',
          600: '#2F6750',
          500: '#10B981',
        },
        borderLight: '#EAE4D8',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        'card-glow': '0 10px 30px -5px rgba(197, 158, 95, 0.15)',
        'forest-glow': '0 15px 35px -10px rgba(12, 30, 23, 0.35)',
      },
    },
  },
  plugins: [],
}
