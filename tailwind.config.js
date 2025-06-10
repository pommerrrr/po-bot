/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deriv: {
          red: '#ff444f',
          dark: '#0e0e0e'
        }
      },
      animation: {
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out'
      }
    },
  },
  plugins: [],
}
