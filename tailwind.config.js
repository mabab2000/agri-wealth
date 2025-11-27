/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rwanda': {
          blue: '#00A1DE',
          yellow: '#FAD201',
          green: '#00A651',
        }
      }
    },
  },
  plugins: [],
}