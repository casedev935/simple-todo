/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0f172a',
        'brand-card': 'rgba(30, 41, 59, 0.7)',
        'brand-primary': '#2b8cee',
        'brand-secondary': '#13c8ec',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
