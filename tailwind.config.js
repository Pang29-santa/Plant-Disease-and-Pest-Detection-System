/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Nature Green (Primary Brand & Theme)
        primary: {
          50: '#f1fcf3',
          100: '#dffce6',
          200: '#c2f7ce',
          300: '#92edaa',
          400: '#5add82',
          500: '#32c262', 
          600: '#239e4e', 
          700: '#1e7d40',
          800: '#1d6337',
          900: '#19512f',
          950: '#0a2d19',
        },
        // Harmonious Sage/Neutral (Secondary)
        secondary: {
          50: '#f6f7f6',
          100: '#e8ebe8',
          200: '#d5dad6',
          300: '#b6bfb8',
          400: '#94a098',
          500: '#75837b',
          600: '#5d6962',
          700: '#4b544f',
          800: '#3f4642',
          900: '#353a38',
          950: '#1a1d1c',
        },
        // Override default green to ensure consistency across hardcoded files
        green: {
          50: '#f1fcf3',
          100: '#dffce6',
          200: '#c2f7ce',
          300: '#92edaa',
          400: '#5add82',
          500: '#32c262', 
          600: '#239e4e', 
          700: '#1e7d40',
          800: '#1d6337',
          900: '#19512f',
          950: '#0a2d19',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Prompt', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
