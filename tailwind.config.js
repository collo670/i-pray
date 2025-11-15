// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html", // Look for HTML files in the root directory
    "./**/*.html", // Include all HTML files in subdirectories
    "./src/**/*.{html,js,ts,jsx,tsx}", // Example for common frontend frameworks
    "./assets/**/*.html", // Include HTML files in assets directory
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      colors: {
        'secondary': '#DB2777',
        'accent': '#F59E0B',
        'liturgical-purple': '#4A1E8A',
        'liturgical-white': '#F8F9FA',
        'liturgical-red': '#C41E3A',
        'liturgical-green': '#2E7D32',
        'liturgical-gold': '#FFD700',
      },
      backgroundImage: {
        'vintage-texture': 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      },
      animation: {
        'hamburger-to-x': 'hamburger-to-x 0.3s ease-in-out',
        'mobile-menu-slide': 'mobile-menu-slide 0.3s ease-in-out',
      },
      keyframes: {
        'hamburger-to-x': {
          '0%': { transform: 'rotate(0deg) translate(0, 0)' },
          '50%': { opacity: '0' },
          '100%': { transform: 'rotate(45deg) translate(-5px, 6px)' },
        },
        'mobile-menu-slide': {
          '0%': { maxHeight: '0', opacity: '0' },
          '100%': { maxHeight: '500px', opacity: '1' },
        }
      },
      transitionProperty: {
        'max-height': 'max-height',
        'transform': 'transform',
      }
    },
  },
  plugins: [],
}