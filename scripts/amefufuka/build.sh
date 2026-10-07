#!/bin/sh
# Regenerate the Amefufuka songbook pages from docs/pdfs/amefufuka.pdf.
#
#   pages/amefufuka.html        index of every red song title, by book page
#   pages/amefufuka/*.html      one page per song: lyrics with each chord
#                               anchored over the syllable it is printed above
#   pages/amefufuka/img/*.png   chord diagrams / music printed as graphics
#
# Needs python3 with pdfplumber and Pillow, and pdftoppm (poppler-utils).
# Page 222 of the PDF is a scanned photo with no text layer; it is kept as a
# hand transcription in manual-222.txt.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$HERE/../.." && pwd)
PDF="$ROOT/docs/pdfs/amefufuka.pdf"
WORK=$(mktemp -d)
python3 "$HERE/dump_chars.py" "$PDF" "$WORK/chars.json"
python3 "$HERE/parse.py" "$WORK/chars.json" "$WORK/songs.json"
python3 "$HERE/crops.py" "$WORK/songs.json" "$PDF" "$WORK/figs"
python3 "$HERE/manual.py" "$WORK/songs.json" "$HERE/manual-222.txt"
python3 "$HERE/build_html.py" "$WORK/songs.json" "$WORK/figs" "$ROOT"
rm -rf "$WORK"
