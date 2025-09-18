const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

(async () => {
  const ROOT = path.resolve(__dirname, '..');
  const PDF_PATH = path.join(ROOT, 'PDFS', 'MwakaSehemu2.pdf');
  const OUT_PATH = path.join(ROOT, 'MwakaSehemu2.txt');
  const buf = fs.readFileSync(PDF_PATH);
  const data = await pdf(buf);
  fs.writeFileSync(OUT_PATH, data.text || '', 'utf8');
  console.log('Wrote', OUT_PATH);
})().catch(err => { console.error(err); process.exit(1); });


