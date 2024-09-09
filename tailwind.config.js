/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "wordle-green": "#6BBF59",
        "wordle-red": "#C80000",
        "wordle-grey": "#919090",
        "wordle-yellow": "#FFAC1C",
        "wordle-blue": "#08addd",
      }
    },
  },
  plugins: [],
}

