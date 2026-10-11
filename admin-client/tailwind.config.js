/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FAFAFA',
        container: '#F4F4F5',
        charcoal: '#09090B',
        borderline: '#E4E4E7',
        accent: {
          light: '#A5B4FC', // Soft pastel indigo
          DEFAULT: '#6366F1', // Indigo primary
          dark: '#4338CA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
