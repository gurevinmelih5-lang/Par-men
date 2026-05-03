/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          light: '#FDFBF7',
          DEFAULT: '#F5F0E6',
          dark: '#E8DCC4'
        },
        ink: {
          light: '#2D3748',
          DEFAULT: '#1A202C',
          dark: '#0F172A'
        },
        karma: {
          DEFAULT: '#D4AF37',
          light: '#E5C158',
          dark: '#B08D22'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
