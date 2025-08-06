// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html", // Look for HTML files in the root directory
    "./src/**/*.{html,js,ts,jsx,tsx}", // Example for common frontend frameworks
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}