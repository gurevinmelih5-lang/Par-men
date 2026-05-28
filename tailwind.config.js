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
          light: 'rgb(var(--color-bg-base) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-bg-card-alt) / <alpha-value>)',
          dark: 'rgb(var(--color-bg-dark) / <alpha-value>)'
        },
        ink: {
          light: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-text-primary) / <alpha-value>)',
          dark: 'rgb(var(--color-text-muted) / <alpha-value>)'
        },
        karma: {
          DEFAULT: 'rgb(var(--color-karma) / <alpha-value>)',
          light: 'rgb(var(--color-karma-light) / <alpha-value>)',
          dark: 'rgb(var(--color-karma-dark) / <alpha-value>)'
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
