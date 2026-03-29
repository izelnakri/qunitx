import { readFile } from 'node:fs/promises';

const THRESHOLD = 85;
const lcov = await readFile('tmp/coverage/lcov.info', 'utf8');

const lh = [...lcov.matchAll(/^LH:(\d+)/gm)].reduce((s, m) => s + parseInt(m[1]), 0);
const lf = [...lcov.matchAll(/^LF:(\d+)/gm)].reduce((s, m) => s + parseInt(m[1]), 0);
const pct = lf > 0 ? (lh / lf) * 100 : 0;

console.log(`Coverage: ${pct.toFixed(1)}% (${lh}/${lf} lines)`);

if (pct < THRESHOLD) {
  console.error(`Error: coverage ${pct.toFixed(1)}% is below the ${THRESHOLD}% threshold.`);
  process.exit(1);
}
