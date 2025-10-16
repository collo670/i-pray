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