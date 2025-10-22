---
description: Repository Information Overview
alwaysApply: true
---

# iPray - Catholic Prayer App Information

## Summary
iPray is a Progressive Web Application (PWA) designed as a Catholic liturgical companion for daily prayer and worship. It provides access to various prayers, liturgical readings, and religious content in both English and Swahili. The application supports offline functionality through service worker caching and offers a responsive design for various device sizes.

## Structure
- **Root Directory**: Contains HTML files for different prayers and days of the week
- **assets/**: Media files, icons, and monthly prayer content organized by month
- **scripts/**: JavaScript utilities for content generation and extraction
- **src/**: Source files for CSS processing with Tailwind
- **dist/**: Output directory for processed CSS
- **PDFS/**: Source PDF files containing prayer content

## Language & Runtime
**Language**: JavaScript (Node.js)
**Version**: CommonJS module format
**Build System**: PostCSS with Tailwind CSS
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- browser-sync: ^2.29.3 (Development server)
- tailwindcss: ^4.1.11 (CSS framework)
- pdf-parse: ^1.1.1 (PDF content extraction)
- moment: ^2.30.1 (Date handling)
- lite-server: ^2.6.1 (Lightweight development server)

**Development Dependencies**:
- autoprefixer: ^10.4.21
- postcss: ^8.5.6
- postcss-cli: ^11.0.1

## Build & Installation
```bash
npm install
npm run build
```

## PWA Configuration
**Manifest**: manifest.json defines app metadata, icons, and display properties
**Service Worker**: service-worker.js implements optimized caching strategies:
- Critical assets cached immediately for faster initial load
- Non-critical assets cached in background
- Different strategies based on resource types:
  - HTML/navigation: Network-first with cache fallback
  - Static assets: Cache-first with background updates
  - External resources: Network-first approach
**Cache Version**: CACHE_NAME = 'ipray-v202509231746'
**Scope**: /i-pray/

## Performance Optimization
**Service Worker Registration**:
- Registered with scope `/i-pray/`
- Configured with `updateViaCache: 'none'` to always check for updates
- Hourly update checks with user notification for new versions
- Proper event handling for service worker lifecycle

**Resource Loading**:
- Preconnect and DNS prefetch for external resources
- Critical assets prioritized for immediate caching
- Background caching for non-critical resources
- Staggered loading approach for better perceived performance

**GitHub Pages Deployment**:
- All paths prefixed with `/i-pray/` for proper GitHub Pages routing
- Service worker scope set to `/i-pray/`
- Manifest start_url set to `/i-pray/`

## Main Files
**Entry Point**: index.html, index.js
**CSS Processing**: src/input.css → dist/output.css
**Configuration**: 
- tailwind.config.js (Tailwind CSS configuration)
- postcss.config.js (PostCSS plugins configuration)

## Content Generation
**Scripts**:
- generate-mwaka2-weeks.js: Generates weekly prayer content from PDF sources
- extract-compline.js: Extracts compline prayers

**Build Command**:
```bash
npm run generate:mwaka2
npm run extract:compline
```

## Features
- Multilingual support (English/Swahili)
- Offline functionality via service worker
- Responsive design with Tailwind CSS
- Daily prayer tracking
- Liturgical calendar integration
- Text-to-speech functionality
- Theme customization
- Installable PWA with custom install prompts