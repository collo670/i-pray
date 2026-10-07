#!/usr/bin/env node
/*
 * Builds the 28 Masifu ya Asubuhi pages (pages/jumapili1.html ...
 * pages/jumamosi4.html) from one template and each page's prayer text.
 *
 *   templates/masifu-asubuhi.html     the page around the prayer: head,
 *                                     styles, app bar and menu, scripts
 *   content/masifu-asubuhi/<page>.html the prayer itself (the
 *                                     <div class="container"> block), with
 *                                     the page title on its first line:
 *                                     <!-- title: Masifu ya Asubuhi - ... -->
 *
 *   node scripts/build-masifu-pages.js           write pages/*.html
 *   node scripts/build-masifu-pages.js --check   exit 1 if out of date
 *
 * Change the layout, styles or scripts once in the template; change a
 * prayer in its content file; then run `npm run build:generated` and commit
 * the pages it writes. (GitHub Pages serves the files as they are, so the
 * generated pages are committed.)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATE = path.join(ROOT, 'templates', 'masifu-asubuhi.html');
const CONTENT_DIR = path.join(ROOT, 'content', 'masifu-asubuhi');
const DAYS = ['jumapili', 'jumatatu', 'jumanne', 'jumatano', 'alhamisi', 'ijumaa', 'jumamosi'];
const PAGES = [].concat(...DAYS.map((d) => [1, 2, 3, 4].map((w) => d + w)));

const TITLE_LINE = /^<!-- title: (.*?) -->\n/;

function render(name) {
    const template = fs.readFileSync(TEMPLATE, 'utf8');
    const content = fs.readFileSync(path.join(CONTENT_DIR, name + '.html'), 'utf8');
    const m = content.match(TITLE_LINE);
    if (!m) throw new Error(name + ': content file must start with <!-- title: ... -->');
    const body = content.slice(m[0].length).replace(/\n$/, '');
    return template
        .replace('{{title}}', () => m[1])
        .replace('{{content}}', () => body);
}

function main() {
    const check = process.argv.includes('--check');
    const stale = [];
    PAGES.forEach((name) => {
        const out = path.join(ROOT, 'pages', name + '.html');
        const html = render(name);
        const current = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : null;
        if (current === html) return;
        stale.push(name);
        if (!check) fs.writeFileSync(out, html);
    });
    if (check) {
        if (stale.length) {
            console.error('Out of date: ' + stale.join(', ') + '. Run `npm run build:generated`.');
            process.exit(1);
        }
        console.log('Masifu ya Asubuhi pages are up to date.');
    } else {
        console.log('Masifu ya Asubuhi: ' + PAGES.length + ' pages, ' + stale.length + ' rewritten.');
    }
}

if (require.main === module) main();
module.exports = { render, PAGES };
