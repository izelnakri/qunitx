#!/usr/bin/env bash
# Packs the current build into a tarball, installs it into a throwaway consumer
# directory, and verifies the published artefact on every supported runtime.
#
# Runs both a consumer-perspective smoke test (release-consumer-test.ts) and the
# full test suite (test/index.ts) against the installed tarball — NOT against
# local source. This is intentionally different from make check: here 'qunitx'
# resolves to the packed dist output, catching build/packaging bugs that source
# tests cannot see (wrong exports map, missing files, broken deno bundle, etc.).
#
# Usage: bash scripts/test-release.sh
#   (run from the repo root; dist/ must already be built)
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
CONSUMER=$(mktemp -d)
trap 'rm -rf "$CONSUMER"' EXIT

# ── Pack ────────────────────────────────────────────────────────────────────
cd "$ROOT"
npm pack --pack-destination "$CONSUMER" --quiet 2>/dev/null
TARBALL=$(ls "$CONSUMER"/*.tgz | head -1)

# ── Install into a clean consumer directory ─────────────────────────────────
cd "$CONSUMER"
printf '{"type":"module"}' > package.json
npm install --no-save --quiet "$TARBALL"
cp "$ROOT/scripts/release-consumer-test.ts" .
cp -r "$ROOT/test" .

# ── Node ────────────────────────────────────────────────────────────────────
echo "test-release: node (consumer)"
node --test release-consumer-test.ts
echo "test-release: node (full suite)"
node --test test/index.ts

# ── Deno shim integrity ──────────────────────────────────────────────────────
# dist/deno/index.js must contain no jsr: imports. When Deno loads npm:qunitx
# it delegates to Node's ESM loader, which cannot resolve jsr: URLs and throws
# ERR_UNSUPPORTED_ESM_URL_SCHEME. The build bundles all jsr: deps inline to
# eliminate this — this check confirms the bundle step ran correctly.
echo "test-release: deno shim integrity"
if grep -q '"jsr:' node_modules/qunitx/dist/deno/index.js; then
  echo "FAIL: dist/deno/index.js still contains jsr: imports — npm:qunitx will break in Deno"
  exit 1
fi

# ── Deno ─────────────────────────────────────────────────────────
echo "test-release: deno (consumer)"
deno test --allow-read release-consumer-test.ts
echo "test-release: deno (full suite)"
deno test --no-check --allow-read --allow-run test/index.ts
