/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFCDB2',
        secondary: '#FFB4A2',
        accent: '#E5989B',
        dark: '#B5828C',
      },
    },
  },
  plugins: [],
}