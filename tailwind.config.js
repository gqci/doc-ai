/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#1A1B1E',
        'brand-navy': '#1E1F23',
        'brand-red': '#FF4B55',
        'brand-gray': '#2A2B2F',
        'brand-text': '#FFFFFF',
        'brand-text-secondary': '#9CA3AF',
        'brand-logo': '#00A7E1' // GQCI blue color
      }
    },
  },
  plugins: [],
};