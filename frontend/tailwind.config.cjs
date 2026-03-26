/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1F2937',
        accent: '#1649FF',
        background: '#FFFFFF',
      },
    },
  },
  plugins: [],
}
