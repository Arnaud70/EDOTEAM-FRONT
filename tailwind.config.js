/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        togo: {
          green: '#006B3F',
          yellow: '#FFD100',
          red: '#E30A17',
        },
        elite: {
          emerald: '#064e3b',
          gold: '#d4af37',
          surface: 'rgba(255, 255, 255, 0.05)',
          glass: 'rgba(255, 255, 255, 0.7)',
        }
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'premium': '0 20px 50px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
