// Playwright end-to-end tests: `npm run test:e2e`.
// The app is served by scripts/serve.js at /i-pray/, the same path it has on
// GitHub Pages. Tests never touch the real network: tests/e2e/helpers.js
// blocks every outside request and answers the Universalis proxies with the
// pages in tests/fixtures/universalis/.
const { defineConfig, devices } = require('@playwright/test');

const PORT = 4173;

module.exports = defineConfig({
    testDir: 'tests/e2e',
    timeout: 30000,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
    use: {
        baseURL: 'http://localhost:' + PORT + '/i-pray/',
        // Only the offline tests opt in to the service worker.
        serviceWorkers: 'block'
    },
    projects: [
        { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } }
    ],
    webServer: {
        command: 'node scripts/serve.js ' + PORT,
        url: 'http://localhost:' + PORT + '/i-pray/',
        reuseExistingServer: !process.env.CI
    }
});
