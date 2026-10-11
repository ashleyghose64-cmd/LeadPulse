/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F2F3F5',
        container: '#FFFFFF',
        charcoal: '#1A1A1A',
        borderline: '#EAEAEA',
        accent: {
          light: '#FF8A65',
          DEFAULT: '#F05123',
          dark: '#D84315',
        }
      },
      fontFamily: {
        sans: ['"Creato Display"', 'system-ui', 'sans-serif'],
        body: ['"Creato Display"', 'system-ui', 'sans-serif'],
        display: ['"Delight"', 'system-ui', 'sans-serif'],
        heading: ['"Delight"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [],
}
