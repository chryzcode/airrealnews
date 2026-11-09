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
        arn: {
          gold: '#c28b24',
          goldLight: '#e5a93c',
          goldDark: '#936615',
          navy: '#0c1322',
          navyLight: '#162238',
          navyDark: '#070b14',
          charcoal: '#1a1e24',
          red: '#c02626',
          redDark: '#991b1b',
          sand: '#f8f6f0',
          sandDark: '#eeebd9',
        }
      },
      fontFamily: {
        serif: ['"Merriweather"', '"Georgia"', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        headline: ['"Playfair Display"', '"Merriweather"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}

