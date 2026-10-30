/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050B14',
          900: '#0A192F',
          850: '#0C1E38',
          800: '#0F264A',
          700: '#173A6B',
          600: '#23508F',
          100: '#E1E9F5',
        },
        teal: {
          900: '#134E4A',
          800: '#115E59',
          700: '#0F766E',
          600: '#0D9488',
          500: '#14B8A6',
          400: '#2DD4BF',
          300: '#5EEAD4',
          200: '#99F6E4',
          100: '#CCFBF1',
          50: '#F0FDFA',
        },
        gold: {
          700: '#B45309',
          600: '#D97706',
          500: '#F59E0B',
          400: '#FBBF24',
          300: '#FCD34D',
          200: '#FDE68A',
          100: '#FEF3C7',
          50: '#FFFBEB',
        },
        ivory: {
          50: '#FDFBF7',
          100: '#F8F6F0',
          200: '#F0ECE1',
          300: '#E2DBD0',
        },
        'luxury-navy': '#0A192F',
        'luxury-navy-light': '#0F264A',
        'luxury-gold': '#D97706',
        'luxury-gold-light': '#F59E0B',
        'luxury-teal': '#0D9488',
        'luxury-teal-dark': '#0F766E',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(10, 25, 47, 0.12), 0 4px 6px -2px rgba(10, 25, 47, 0.04)',
        'luxury-hover': '0 20px 40px -15px rgba(10, 25, 47, 0.2), 0 8px 10px -4px rgba(10, 25, 47, 0.06)',
        'gold-glow': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'teal-glow': '0 0 25px -5px rgba(20, 184, 166, 0.35)',
      }
    },
  },
  plugins: [],
}
