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
#   docs/browser-*.png          — browser screenshots (playwright)
#   docs/demo.gif               — final composite (1000×500, ~500 KB)

set -euo pipefail
cd "$(dirname "$0")/.."
DOCS=docs
TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

# ── Safety trap ───────────────────────────────────────────────────────────────
# The tape's mid-recording hidden section swaps demo-math-test.ts with the
# buggy version and schedules a background restore. If VHS exits early the
# backup may be left behind; this trap restores it so the repo stays clean.
trap 'if [ -f "$DOCS/demo-math-test-backup.ts" ]; then mv -f "$DOCS/demo-math-test-backup.ts" "$DOCS/demo-math-test.ts"; fi; rm -rf "$TMP"' EXIT

# ── 1. Terminal GIF via VHS ────────────────────────────────────────────────────
# Ensure node_modules/qunitx symlink exists so `npx qunitx` works in the demo.
echo "==> Setting up qunitx symlink for demo..."
node build.ts 2>/dev/null
node --input-type=module -e "import{symlinkSync}from'fs';try{symlinkSync('..','node_modules/qunitx','junction')}catch(_){}" 2>/dev/null || true

echo "==> Recording terminal animation (VHS)..."
nix run nixpkgs#vhs -- "$DOCS/demo.tape"
echo "    terminal.gif: $(du -h "$DOCS/terminal.gif" | cut -f1)"

# ── 2. Browser screenshots via playwright ─────────────────────────────────────
echo "==> Taking browser screenshots..."
if [[ -z "${CHROME_BIN:-}" ]]; then
  CHROME_BIN=$(nix eval --raw nixpkgs#chromium.outPath 2>/dev/null)/bin/chromium || true
fi
CHROME_BIN="${CHROME_BIN:-}" node "$DOCS/take-browser-screenshots.js"

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

# ── 5. Browser slideshow: 5 phases synced to terminal events ──────────────────
#
# The browser slideshow mirrors what's happening in the terminal:
#
#   Phase 1 — PASSING (green) — bat shows test file + node --test passes
#   Phase 2 — FAILING (red)   — watch mode starts, tests fail (buggy file)
#   Phase 3 — PASSING (green) — background fix fires, watch reruns → GREEN
#   Phase 4 — FILTERED        — Ctrl+C done, deno test running
#   Phase 5 — EXPANDED        — deno done
#
# Percentages calibrated for the expected ~30s GIF:
#   bat + node --test  ≈ 30% — terminal shows clean file passing
#   watch RED          ≈  9% — watch output failing (buggy file), ~2.5s
#   watch GREEN        ≈ 16% — watch output passing after fix, ~4s
#   deno               ≈ 14% — filtered module, shareable URL feature
#   qunitx / finale    ≈ 31% — expanded assertion detail, the browser UI climax
#
D_passing1=$(( DURATION * 30 / 100 ))  # bat + node --test on clean file
D_failing=$(( DURATION *  9 / 100 ))   # watch red
D_passing2=$(( DURATION * 16 / 100 ))  # watch green
D_filtered=$(( DURATION * 14 / 100 ))  # deno — filtered module view
D_expanded=$(( DURATION - D_passing1 - D_failing - D_passing2 - D_filtered ))  # qunitx — expanded detail

echo "==> Building browser slideshow (${D_passing1}s passing / ${D_failing}s failing / ${D_passing2}s passing / ${D_filtered}s filtered / ${D_expanded}s expanded)..."
cat > "$TMP/browser_list.txt" << EOF
file '$(realpath $DOCS/browser-2-all-passed.png)'
duration $D_passing1
file '$(realpath $DOCS/browser-1-failing.png)'
duration $D_failing
file '$(realpath $DOCS/browser-2-all-passed.png)'
duration $D_passing2
file '$(realpath $DOCS/browser-3-filtered.png)'
duration $D_filtered
file '$(realpath $DOCS/browser-4-expanded.png)'
duration $D_expanded
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
