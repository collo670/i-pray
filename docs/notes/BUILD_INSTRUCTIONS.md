# Building Tailwind CSS for Local Use

## Current Status
The project is currently using Tailwind CSS via CDN to ensure styles work immediately. To switch to the compiled local version:

## Steps to Build and Use Local Tailwind CSS

1. **Build the CSS file:**
   ```bash
   npm run build
   ```
   This will compile `src/input.css` to `dist/output.css`

2. **Update index.html:**
   Replace the CDN script with:
   ```html
   <link rel="stylesheet" href="dist/output.css">
   ```
   And remove the `<script src="https://cdn.tailwindcss.com"></script>` and inline config.

## Configuration Files

- **`src/input.css`** - Tailwind source file with custom theme
- **`tailwind.config.js`** - Tailwind configuration (for v3 compatibility)
- **`postcss.config.js`** - PostCSS configuration for Tailwind v4
- **`dist/output.css`** - Compiled output (generated after build)

## Custom Theme
The following custom colors and utilities are configured:
- Custom colors: secondary, accent, liturgical-*
- Custom breakpoints: xs, 3xl
- Custom animations: hamburger-to-x, mobile-menu-slide
- Custom background: vintage-texture

