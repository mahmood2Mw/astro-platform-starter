#!/bin/bash
# Render preview stills: scripts/stills.sh 40 130 ...
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
mkdir -p out
for f in "$@"; do npx remotion still src/index.ts AlyaqinPromo out/s$f.png --frame=$f --scale=0.5 --browser-executable=$B --log=error & done; wait
