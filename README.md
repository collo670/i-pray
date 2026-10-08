# ipray

A Catholic prayer companion in Kiswahili and English: the Liturgy of the
Hours (Masifu ya Asubuhi, Ofisi ya Masomo, Sala ya Mchana, Masifu ya Jioni,
Sala ya Usiku), the daily readings, the Holy Rosary, the Way of the Cross,
the Amefufuka songbook and the liturgical calendar. It is a static site
served by GitHub Pages at `/i-pray/` and works offline once opened.

## Working on it

```sh
npm install
npm start                 # http://localhost:8080/i-pray/
npm test                  # unit tests, then browser tests (Playwright)
npm run build:generated   # rebuild every generated file (see below)
```

CI (`.github/workflows/ci.yml`) runs on pull requests and on `main`: it
checks that generated files are up to date, then runs `npm test`.

## Generated files

GitHub Pages serves the repository as it is, so generated files are
committed. After changing their sources, run `npm run build:generated`.

| File(s) | Built from | By |
| --- | --- | --- |
| `dist/output.css` | `src/input.css` + the classes used in the pages | Tailwind (`npm run build`) |
| `pages/jumapili1.html` … `pages/jumamosi4.html` (Masifu ya Asubuhi) | `templates/masifu-asubuhi.html` + `content/masifu-asubuhi/<page>.html` | `scripts/build-masifu-pages.js` |
| the install list in `service-worker.js` | the files on disk | `scripts/build-sw.js` |

To change a Morning Prayer, edit its file in `content/masifu-asubuhi/`. To
change the layout, styles or scripts of all 28 pages, edit the template.

## Where things live

- `js/liturgical-calendar.js`: seasons, weeks and the celebration of each
  day, with the Church's rules of precedence; feast names in English and
  Kiswahili.
- `js/i18n.js`: the app's one language setting (`IPrayI18n`), loaded on
  every page.
- `js/library.js`: favourites, recently opened prayers, and "continue
  where you left off".
- `js/reminders.js`: prayer reminders (phone calendar file and
  notifications), set up in Settings.
- `js/offline-week.js`: Settings' "Save this week" for offline use.
- `js/universalis-office.js`: fetches Midday Prayer, Vespers and the English
  Office of Readings from Universalis and keeps only the prayer text.
- `service-worker.js`: offline support.
- `data/office-readings-sw/`: the Swahili Office of Readings (Ordinary
  Time, Advent, Christmas, Trinity, Corpus Christi), extracted from the
  books in `docs/pdfs/` by `npm run extract:readings-sw`.

## The Cloudflare Worker

`cloudflare-worker/ipray-worker.js` lets the browser read bolls.life (Bible
verses) and Universalis (the English hours), which send no CORS headers.
Deploy it by pasting the file into the Worker the app uses
(`ancient-rice-28a1`) in the Cloudflare dashboard; the steps are at the top
of the file. Until it is deployed, the app falls back to public CORS
proxies for Universalis.
