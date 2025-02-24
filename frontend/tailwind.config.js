/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#FFCDB2',
        secondary: '#FFB4A2',
        accent: '#E5989B',
        dark: '#B5828C',
      },
      backgroundColor: {
        'dark-primary': '#1a1a1a',
        'dark-secondary': '#2d2d2d',
      },
      textColor: {
        'dark-primary': '#ffffff',
        'dark-secondary': '#e0e0e0',
      },
      animation: {
        'spin-slow': 'spin-slow 3s linear infinite',
        'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}