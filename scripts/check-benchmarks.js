#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env
// Regression checker for qunitx benchmarks.
//
// Usage:
//   # Check against saved baseline (fails if any result regresses > threshold):
//   deno bench --allow-read --json benches/*.bench.js | deno run --allow-read --allow-write --allow-env scripts/check-benchmarks.js
//
//   # Save current results as new baseline:
//   deno bench --allow-read --json benches/*.bench.js | deno run --allow-read --allow-write --allow-env scripts/check-benchmarks.js --save

import { red, green, yellow, dim } from 'jsr:@std/fmt/colors';

const BASELINE_PATH = new URL('../benches/results.json', import.meta.url).pathname;
const REGRESSION_THRESHOLD = Number(Deno.env.get('REGRESSION_THRESHOLD') ?? '20');
const isSave = Deno.args.includes('--save');

const raw = await new Response(Deno.stdin.readable).text();
const data = JSON.parse(raw);

// Flatten results: name → avg nanoseconds
const current = {};
for (const bench of data.benches) {
  const ok = bench.results?.[0]?.ok;
  if (ok) {
    current[bench.name] = ok.avg;
  }
}

if (isSave) {
  await Deno.writeTextFile(BASELINE_PATH, JSON.stringify(current, null, 2) + '\n');
  console.log(`Saved baseline → benches/results.json (${Object.keys(current).length} entries)`);
  Deno.exit(0);
}

let baseline;
try {
  baseline = JSON.parse(await Deno.readTextFile(BASELINE_PATH));
} catch {
  console.log('No baseline found. Run with --save to create one.');
  Deno.exit(0);
}

function fmt(ns) {
  if (ns >= 1e9) return `${(ns / 1e9).toFixed(2)}s`;
  if (ns >= 1e6) return `${(ns / 1e6).toFixed(2)}ms`;
  if (ns >= 1e3) return `${(ns / 1e3).toFixed(2)}µs`;
  return `${ns.toFixed(2)}ns`;
}

let hasRegression = false;
const rows = [];

for (const [name, avgNs] of Object.entries(current)) {
  const baseNs = baseline[name];
  if (baseNs == null) {
    rows.push({ name, avgNs, status: 'new' });
    continue;
  }
  const pct = ((avgNs - baseNs) / baseNs) * 100;
  if (pct > REGRESSION_THRESHOLD) hasRegression = true;
  rows.push({ name, avgNs, baseNs, pct, status: pct > REGRESSION_THRESHOLD ? 'fail' : 'ok' });
}

const maxName = Math.max(...rows.map((r) => r.name.length));

for (const row of rows) {
  const pad = row.name.padEnd(maxName);
  if (row.status === 'new') {
    console.log(`  ${yellow('NEW ')} ${pad}  ${fmt(row.avgNs)}`);
  } else if (row.status === 'fail') {
    console.log(
      `  ${red('FAIL')} ${pad}  ${fmt(row.avgNs)}  ${red(`+${row.pct.toFixed(1)}%`)} vs ${dim(fmt(row.baseNs))}`
    );
  } else {
    const sign = row.pct >= 0 ? '+' : '';
    const pctStr = `${sign}${row.pct.toFixed(1)}%`;
    console.log(
      `  ${green('OK  ')} ${pad}  ${fmt(row.avgNs)}  ${row.pct < -5 ? green(pctStr) : dim(pctStr)} vs ${dim(fmt(row.baseNs))}`
    );
  }
}

if (hasRegression) {
  console.error(`\n${red(`Regressions detected (threshold: ${REGRESSION_THRESHOLD}%)`)}`);
  Deno.exit(1);
} else {
  console.log(`\n${green(`All benchmarks within threshold (${REGRESSION_THRESHOLD}%)`)}`);
}
