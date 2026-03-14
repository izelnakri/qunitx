#!/usr/bin/env bash
# Regenerates docs/demo.gif — the combined terminal + browser demo GIF.
#
# Prerequisites (available in the nix devShell):
#   nix run nixpkgs#vhs        — terminal recorder
#   CHROME_BIN                 — path to Chromium binary
#   ffmpeg, gifsicle           — compositing and optimisation
#
# Usage:
#   export CHROME_BIN=/nix/store/<hash>-chromium-<ver>/bin/chromium
#   bash docs/make-demo-gif.sh
#
# Outputs:
#   docs/terminal.gif           — terminal-only animation (VHS)
#   docs/browser-*.png          — browser screenshots (puppeteer)
#   docs/demo.gif               — final composite (1000×500, ~500 KB)

set -euo pipefail
cd "$(dirname "$0")/.."
DOCS=docs
TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

# ── 1. Terminal GIF via VHS ────────────────────────────────────────────────────
echo "==> Recording terminal animation (VHS)..."
nix run nixpkgs#vhs -- "$DOCS/demo.tape"
echo "    terminal.gif: $(du -h "$DOCS/terminal.gif" | cut -f1)"

# ── 2. Browser screenshots via puppeteer ──────────────────────────────────────
echo "==> Taking browser screenshots..."
if [[ -z "${CHROME_BIN:-}" ]]; then
  CHROME_BIN=$(nix eval --raw nixpkgs#chromium.outPath)/bin/chromium
fi
CHROME_BIN="$CHROME_BIN" node "$DOCS/take-browser-screenshots.js"

# ── 3. Get terminal duration ───────────────────────────────────────────────────
DURATION=$(ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "$DOCS/terminal.gif")
DURATION=${DURATION%.*}

# ── 4. Terminal: scale to 500×500, per-module palette, optimise ───────────────
echo "==> Scaling terminal to 500×500..."
ffmpeg -y -i "$DOCS/terminal.gif" \
  -vf "fps=8,scale=500:500:flags=lanczos,pad=500:500:(ow-iw)/2:(oh-ih)/2,split[a][b];[a]palettegen=max_colors=200[p];[b][p]paletteuse" \
  -t "$DURATION" -loop 0 "$TMP/terminal_small.gif" 2>/dev/null
nix run nixpkgs#gifsicle -- -O3 --lossy=80 "$TMP/terminal_small.gif" -o "$TMP/terminal_opt.gif" 2>/dev/null

# ── 5. Browser slideshow: scale to 500×500, 2fps ──────────────────────────────
# Frame timing:
#   1. Failing tests + deepEqual diff  — 14s (give viewers time to read the diff)
#   2. All passing (simulated refresh) —  8s (quick "it's fixed!")
#   3. Filtered to Async module        —  8s (shareable URL demo)
#   4. deepEqual test expanded         — remainder
D1=14
D2=8
D3=8
D4=$(( DURATION - D1 - D2 - D3 ))
echo "==> Building browser slideshow (${D1}s / ${D2}s / ${D3}s / ${D4}s)..."
cat > "$TMP/browser_list.txt" << EOF
file '$(realpath $DOCS/browser-1-failing.png)'
duration $D1
file '$(realpath $DOCS/browser-2-all-passed.png)'
duration $D2
file '$(realpath $DOCS/browser-3-filtered.png)'
duration $D3
file '$(realpath $DOCS/browser-4-expanded.png)'
duration $D4
file '$(realpath $DOCS/browser-4-expanded.png)'
EOF

ffmpeg -y -f concat -safe 0 -i "$TMP/browser_list.txt" \
  -vf "fps=2,scale=500:500:flags=lanczos,pad=500:500:(ow-iw)/2:(oh-ih)/2,split[a][b];[a]palettegen=max_colors=200[p];[b][p]paletteuse" \
  -t "$DURATION" -loop 0 "$TMP/browser_small.gif" 2>/dev/null
nix run nixpkgs#gifsicle -- -O3 --lossy=80 "$TMP/browser_small.gif" -o "$TMP/browser_opt.gif" 2>/dev/null

# ── 6. Composite: hstack with shared palette ──────────────────────────────────
echo "==> Compositing side-by-side..."
ffmpeg -y -i "$TMP/terminal_opt.gif" -i "$TMP/browser_opt.gif" \
  -filter_complex \
  "[0:v][1:v]hstack=inputs=2,split[a][b]; \
   [a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=5" \
  -t "$DURATION" -loop 0 "$TMP/combined.gif" 2>/dev/null

# ── 7. Final optimise ─────────────────────────────────────────────────────────
echo "==> Optimising with gifsicle..."
nix run nixpkgs#gifsicle -- -O3 --lossy=100 "$TMP/combined.gif" -o "$DOCS/demo.gif" 2>/dev/null

echo "==> Done: $DOCS/demo.gif ($(du -h "$DOCS/demo.gif" | cut -f1))"
