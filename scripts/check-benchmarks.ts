#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run
/**
 * Benchmark regression checker for qunitx.
 *
 * Modes
 * -----
 * Default (stdin)
 *   Reads `deno bench --json` output from stdin, compares each benchmark's
 *   average nanoseconds against the stored baseline in benches/results.json.
 *   A result is a regression only when BOTH conditions hold:
 *     1. percentage increase > effective threshold
 *     2. absolute delta > MIN_ABS_DELTA_NS (guards sub-µs JIT/GC noise)
 *
 * --files <file> [file…]   (recommended)
 *   Runs each bench file in an isolated subprocess so that GC pressure from
 *   one group cannot inflate latencies in another. Combines the per-file JSON
 *   before checking. Tighter multipliers are safe because cross-file GC
 *   interference is eliminated.
 *
 * --save
 *   Saves the measured values as the new baseline instead of checking.
 *
 * Environment variables
 * ---------------------
 *   REGRESSION_THRESHOLD  percent threshold (default 26)
 *   MIN_ABS_DELTA_NS      absolute delta floor in nanoseconds (default 1000 = 1µs)
 *   SKIP_BENCHMARK        comma-separated bench-file basenames to skip (without
 *                         `.bench.ts`). Special values `true|1|all` short-circuit
 *                         the whole gate. Useful when laptop load makes benches
 *                         falsely regress; CI keeps the strict gate.
 *                         Examples:
 *                           SKIP_BENCHMARK=true         # skip everything
 *                           SKIP_BENCHMARK=utils        # skip benches/utils.bench.ts
 *                           SKIP_BENCHMARK=utils,assert # skip multiple files
 *
 * Usage
 * -----
 *   # isolated (preferred):
 *   deno run --allow-all scripts/check-benchmarks.ts \
 *     --files benches/assert.bench.ts benches/context.bench.ts benches/utils.bench.ts
 *
 *   # pipe-based (legacy):
 *   deno bench --allow-read --allow-env --json benches/*.bench.ts \
 *     | deno run --allow-read --allow-write --allow-env scripts/check-benchmarks.ts
 *
 *   # save new baseline:
 *   deno run --allow-all scripts/check-benchmarks.ts --save \
 *     --files benches/assert.bench.ts benches/context.bench.ts benches/utils.bench.ts
 */

import { bold, dim, gray, green, red, yellow } from 'jsr:@std/fmt/colors';

const BASELINE_FILE = new URL('../benches/results.json', import.meta.url).pathname;

interface BenchResult {
  name: string;
  avg: number; // nanoseconds
}

interface DenoJsonOutput {
  version: number;
  benches: Array<{
    name: string;
    results: Array<{ ok?: { avg: number } }>;
    [key: string]: unknown;
  }>;
}

interface Baseline {
  savedAt: string;
  results: Record<string, number>; // bench name → avg nanoseconds
}

// ─── I/O helpers ─────────────────────────────────────────────────────────────

async function readStdin(): Promise<string> {
  return new Response(Deno.stdin.readable).text();
}

/** Runs a single bench file in an isolated subprocess and returns its parsed results. */
async function runBenchFile(file: string): Promise<BenchResult[]> {
  const cmd = new Deno.Command('deno', {
    args: ['bench', '--no-check', '--allow-read', '--allow-env', '--json', file],
    stdout: 'piped',
    stderr: 'inherit',
  });
  const { code, stdout } = await cmd.output();
  if (code !== 0) Deno.exit(code);
  return parseResults(new TextDecoder().decode(stdout));
}

/**
 * Merges two result sets by per-benchmark min — system noise only ever inflates
 * timings, so the minimum across runs is the most deterministic measurement of
 * intrinsic cost. Names present in only one side are kept as-is.
 */
function mergeMin(a: BenchResult[], b: BenchResult[]): BenchResult[] {
  const byName = new Map(a.map((r) => [r.name, r.avg]));
  for (const { name, avg } of b) {
    const prev = byName.get(name);
    byName.set(name, prev !== undefined ? Math.min(prev, avg) : avg);
  }
  return Array.from(byName, ([name, avg]) => ({ name, avg }));
}

/**
 * Best-of-2 across files. Used when establishing a baseline (--save) or when no
 * baseline exists yet, so the saved numbers are not biased by a single spike.
 */
async function collectBestOf2(files: string[]): Promise<BenchResult[]> {
  const all: BenchResult[] = [];
  for (const file of files) {
    const runA = await runBenchFile(file);
    const runB = await runBenchFile(file);
    all.push(...mergeMin(runA, runB));
  }
  return all;
}

/**
 * Adaptive collection for --check: each file runs once, and only files whose
 * benchmarks would regress against the baseline are retried (up to MAX_ATTEMPTS
 * total runs, taking the per-benchmark min). In the happy case this is ~half
 * the wall-clock of best-of-2; in the noisy case it self-stabilises by gathering
 * more samples for exactly the benches that need them.
 */
async function collectAdaptive(
  files: string[],
  baseline: Baseline,
  thresholdPct: number,
  minAbsDeltaNs: number,
): Promise<BenchResult[]> {
  const MAX_ATTEMPTS = 3;
  const threshold = thresholdPct / 100;
  const all: BenchResult[] = [];
  for (const file of files) {
    let results = await runBenchFile(file);
    for (let attempt = 1; attempt < MAX_ATTEMPTS; attempt++) {
      const stillRegressing = results.some(({ name, avg }) => {
        const saved = baseline.results[name];
        return saved !== undefined && isRegression(avg, saved, threshold, minAbsDeltaNs);
      });
      if (!stillRegressing) break;
      results = mergeMin(results, await runBenchFile(file));
    }
    all.push(...results);
  }
  return all;
}

/**
 * Resolve and apply SKIP_BENCHMARK. Returns the file list to run; exits 0 if
 * the user asked to skip everything. File matching is by basename minus the
 * `.bench.ts` suffix, so SKIP_BENCHMARK=utils picks `benches/utils.bench.ts`.
 */
function applySkipBenchmark(files: string[]): string[] {
  const raw = (Deno.env.get('SKIP_BENCHMARK') ?? '').trim();
  if (!raw) return files;

  if (['true', '1', 'all'].includes(raw.toLowerCase())) {
    console.log(yellow(`SKIP_BENCHMARK=${raw} → skipping all benchmark checks`));
    Deno.exit(0);
  }

  const skipNames = raw.split(',').map((s) => s.trim()).filter(Boolean);
  const remaining = files.filter((f) => {
    const base = f.replace(/^.*\//, '').replace(/\.bench\.ts$/, '');
    return !skipNames.includes(base);
  });
  const skipped = files.filter((f) => !remaining.includes(f));
  if (skipped.length > 0) {
    const names = skipped.map((f) => f.replace(/^.*\//, '')).join(', ');
    console.log(dim(`Skipping bench files via SKIP_BENCHMARK: ${names}`));
  }
  return remaining;
}

// ─── Parsing ─────────────────────────────────────────────────────────────────

function parseResults(raw: string): BenchResult[] {
  let parsed: DenoJsonOutput;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error('check-benchmarks: failed to parse JSON from stdin.');
    console.error('Make sure you piped the output of: deno bench --json ...');
    Deno.exit(1);
  }

  if (!Array.isArray(parsed.benches)) {
    console.error('check-benchmarks: unexpected JSON shape (missing .benches array).');
    Deno.exit(1);
  }

  return parsed.benches.flatMap((b) => {
    const avg = b.results?.[0]?.ok?.avg;
    if (avg === undefined) return [];
    return [{ name: b.name, avg }];
  });
}

// ─── Threshold logic ─────────────────────────────────────────────────────────

// Two-tier model: the *gate* (whether a regression fails the build) and the *colouring*
// (whether a row prints in red/yellow). Sub-millisecond benches are normally observational —
// GC pauses and scheduler interference produce 100–300% swings on commodity hardware
// (laptops + free CI runners) that no fixed threshold can absorb. They still print and are
// coloured so trends are visible, but only fail the release when their regression is so
// large it cannot plausibly be noise (the HARD_CEILING_MULTIPLIER below).
const SUB_MS_NS = 1_000_000; //   1 ms — below this, regressions are non-gating except at the hard ceiling
const SPAWN_NS = 100_000_000; // 100 ms — at or above this, work involves a process spawn

// Even non-gated benches block the release when their regression exceeds the effective
// threshold by this multiple — i.e., genuinely catastrophic regressions (an accidental
// O(n²), an infinite loop, a hot-path slowdown of 10× or more) still fire. Calibrated
// against observed sub-ms noise peaks (~300%): 10× × 2× sub-ms multiplier × 26 default
// threshold = 520%, which leaves ~1.7× margin above the noise floor while still catching
// real catastrophes. The trade-off: moderate real regressions in sub-ms benches (2–3×) are
// invisible to the gate — that's the cost of not having a quiet-CPU substrate.
const HARD_CEILING_MULTIPLIER = 10;

/**
 * Whether a regression at this bench's magnitude should fail the build at the
 * *ordinary* threshold. Sub-millisecond benches are observation-only on commodity
 * hardware; they still gate, but only at HARD_CEILING_MULTIPLIER × the effective threshold.
 */
function isGated(saved: number): boolean {
  return saved >= SUB_MS_NS;
}

/**
 * Threshold multipliers calibrated to observed laptop + GH-runner variance, applied on top
 * of the user's REGRESSION_THRESHOLD policy. Multipliers reflect physics (noise floor of
 * each size class), not user preference — set REGRESSION_THRESHOLD to tune all tiers
 * together rather than tweaking these constants.
 *
 *   < 1 ms     2×    sub-ms colouring; non-gating except at HARD_CEILING_MULTIPLIER.
 *   1ms–100ms  1×    pure CPU work — stable, GC-bound but contained.
 *   ≥ 100 ms   2.5×  spawn-or-larger: process fork/exec etc. OS-bound and load-sensitive;
 *                    flat 1× has no headroom over the 30%+ swings observed on busy machines.
 */
function effectiveThreshold(saved: number, threshold: number): number {
  if (saved < SUB_MS_NS) return threshold * 2;
  if (saved >= SPAWN_NS) return threshold * 2.5;
  return threshold;
}

function isRegression(
  avg: number,
  saved: number,
  threshold: number,
  minAbsDeltaNs: number,
): boolean {
  if (avg - saved <= minAbsDeltaNs) return false; // absolute floor: ignore JIT/GC noise
  const change = (avg - saved) / saved;
  const t = effectiveThreshold(saved, threshold);
  // Sub-ms benches gate only on catastrophic regressions (commodity-hardware noise floor
  // is 100–300%). Gated benches gate on any regression past their effective threshold.
  return isGated(saved) ? change > t : change > t * HARD_CEILING_MULTIPLIER;
}

// ─── Formatting ──────────────────────────────────────────────────────────────

function fmtNs(ns: number): string {
  if (ns >= 1_000_000_000) return `${(ns / 1_000_000_000).toFixed(2)}s`;
  if (ns >= 1_000_000) return `${(ns / 1_000_000).toFixed(2)}ms`;
  if (ns >= 1_000) return `${(ns / 1_000).toFixed(2)}µs`;
  return `${ns.toFixed(0)}ns`;
}

function fmtChange(change: number, threshold: number): string {
  const arrow = change > 0 ? '▲' : '▼';
  const pct = `${arrow}${(Math.abs(change) * 100).toFixed(1)}%`;
  if (change > threshold) return bold(red(pct));
  if (change > threshold / 2) return yellow(pct);
  if (change < 0) return green(pct);
  return dim(pct);
}

function printTable(
  results: BenchResult[],
  baseline: Baseline | null,
  threshold: number,
  minAbsDeltaNs: number,
): void {
  const hasBaseline = baseline !== null;
  const header = '  ' + bold('Name'.padEnd(52)) + bold('avg'.padStart(12)) +
    (hasBaseline ? bold('Baseline'.padStart(12)) + bold('Change'.padStart(10)) : '');
  console.log('\n' + header);
  console.log(gray('  ' + '─'.repeat(hasBaseline ? 86 : 64)));

  for (const { name, avg } of results) {
    const saved = baseline?.results[name];
    if (!hasBaseline || saved === undefined) {
      console.log(`  ${yellow('NEW ')} ${name.padEnd(52)}${fmtNs(avg).padStart(12)}`);
      continue;
    }
    const change = (avg - saved) / saved;
    const t = effectiveThreshold(saved, threshold);
    // FAIL: regression beyond the gate (ordinary threshold for ms+ benches; hard ceiling
    // for sub-ms benches). INFO: sub-ms drift past the colouring threshold but below the
    // hard ceiling — visible signal without blocking the release, since commodity-
    // hardware noise can't be distinguished from real regressions at this scale.
    const fail = isRegression(avg, saved, threshold, minAbsDeltaNs);
    const drift = !fail && !isGated(saved) && change > t;
    const flag = fail ? bold(red(' FAIL')) : drift ? dim(' INFO') : '     ';
    console.log(
      `${flag} ${name.padEnd(52)}${fmtNs(avg).padStart(12)}${dim(fmtNs(saved).padStart(12))}${
        fmtChange(change, t).padStart(10)
      }`,
    );
  }
  console.log();
}

// ─── Save / Check ─────────────────────────────────────────────────────────────

async function loadBaseline(): Promise<Baseline | null> {
  try {
    return JSON.parse(await Deno.readTextFile(BASELINE_FILE));
  } catch {
    return null;
  }
}

async function save(
  results: BenchResult[],
  existing: Baseline | null,
  minAbsDeltaNs: number,
): Promise<void> {
  printTable(results, existing, 0.26, minAbsDeltaNs);

  const baseline: Baseline = {
    savedAt: new Date().toISOString(),
    results: Object.fromEntries(results.map((r) => [r.name, r.avg])),
  };
  await Deno.writeTextFile(BASELINE_FILE, JSON.stringify(baseline, null, 2) + '\n');
  console.log(green(`Baseline saved: ${results.length} benchmark(s) → benches/results.json`));
}

async function check(
  results: BenchResult[],
  baseline: Baseline | null,
  thresholdPct: number,
  minAbsDeltaNs: number,
): Promise<boolean> {
  const threshold = thresholdPct / 100;
  if (!baseline) {
    console.log(yellow('No baseline found in benches/results.json.'));
    console.log(dim("Run 'make bench' once to establish one, then re-run."));
    printTable(results, null, threshold, minAbsDeltaNs);
    return true; // don't fail on first-ever run
  }

  console.log(
    `\nBenchmark regression check (threshold: ${yellow(`${thresholdPct}%`)}, abs floor: ${
      yellow(fmtNs(minAbsDeltaNs))
    })`,
  );
  printTable(results, baseline, threshold, minAbsDeltaNs);

  const failures = results.filter(({ name, avg }) => {
    const saved = baseline.results[name];
    if (saved === undefined) return false;
    return isRegression(avg, saved, threshold, minAbsDeltaNs);
  });

  if (failures.length > 0) {
    console.error(bold(red(`Regressions exceeding ${thresholdPct}% threshold:`)));
    for (const { name, avg } of failures) {
      const saved = baseline.results[name];
      console.error(red(`  FAIL  ${name}: ${fmtNs(saved)} → ${fmtNs(avg)}`));
    }
    console.error(
      dim(
        `\nThese values are the min across up to 3 retry runs — the regression survived every\n` +
          `attempt to resample, so it is unlikely to be transient noise.\n` +
          `\nIf you have evidence this is sustained background load (not the code under test),\n` +
          `retry on an idle machine, raise REGRESSION_THRESHOLD for this run, refresh the\n` +
          `baseline with 'make bench-update', or set SKIP_BENCHMARK=true|<file> to bypass.`,
      ),
    );
    return false;
  }

  const infoCount = results.filter(({ name, avg }) => {
    const saved = baseline.results[name];
    if (saved === undefined || isGated(saved)) return false;
    const change = (avg - saved) / saved;
    const t = effectiveThreshold(saved, threshold);
    return change > t && change <= t * HARD_CEILING_MULTIPLIER;
  }).length;
  console.log(green(`All ${results.length} benchmark(s) within threshold.`));
  if (infoCount > 0) {
    console.log(
      dim(
        `  (${infoCount} INFO row${infoCount === 1 ? '' : 's'}: sub-ms benches drifted past the ` +
          `colouring threshold but below the ${HARD_CEILING_MULTIPLIER}× hard ceiling —\n` +
          `   commodity-hardware noise can't be distinguished from real regressions at this scale.)`,
      ),
    );
  }
  return true;
}

// ─── main ────────────────────────────────────────────────────────────────────

const isSave = Deno.args.includes('--save');
const filesIdx = Deno.args.indexOf('--files');
const minAbsDeltaNs = Number(Deno.env.get('MIN_ABS_DELTA_NS') ?? '1000');
const thresholdPct = parseFloat(Deno.env.get('REGRESSION_THRESHOLD') ?? '26');
const baseline = await loadBaseline();

let results: BenchResult[];
if (filesIdx !== -1) {
  const allFiles = Deno.args.slice(filesIdx + 1).filter((a) => !a.startsWith('--'));
  const files = applySkipBenchmark(allFiles);
  if (files.length === 0) {
    console.log(yellow('All bench files skipped via SKIP_BENCHMARK; nothing to do.'));
    Deno.exit(0);
  }
  // --check with a baseline → adaptive (1 run, retry only on regression).
  // --save or no baseline → best-of-2 so the saved numbers aren't biased by a single spike.
  results = !isSave && baseline
    ? await collectAdaptive(files, baseline, thresholdPct, minAbsDeltaNs)
    : await collectBestOf2(files);
} else {
  results = parseResults(await readStdin());
}

if (isSave) {
  await save(results, baseline, minAbsDeltaNs);
} else {
  const ok = await check(results, baseline, thresholdPct, minAbsDeltaNs);
  if (!ok) Deno.exit(1);
}
