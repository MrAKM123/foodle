/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#E23744', // Primary Spicy Tomato Red
          600: '#cc2130',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        saffron: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#FF9F1C',
          600: '#d97706',
        },
        cream: {
          50: '#FFFDF9',
          100: '#FDFBF7',
          200: '#F7F3EB',
          300: '#EFE9DC',
        },
        charcoal: {
          800: '#232330',
          900: '#191924',
          950: '#0F0F17',
        },
        veg: {
          light: '#EBFBEE',
          DEFAULT: '#2B8A3E',
          dark: '#237032',
        },
        nonveg: {
          light: '#FFF0F1',
          DEFAULT: '#E23744',
          dark: '#B8232F',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(226, 55, 68, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'warm-hover': '0 10px 25px -3px rgba(226, 55, 68, 0.14), 0 4px 10px -2px rgba(0, 0, 0, 0.06)',
        'card': '0 2px 12px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
