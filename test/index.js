import "./setup.js";
import { tap } from 'node:test/reporters';
import { run } from 'node:test';

run({
  concurrency: true,
  files: [
    "./test/commands/index.js",
    "./test/flags/index.js",
    "./test/inputs/index.js",
    "./test/setup/index.js",
  ],
  // timeout: 20000
})
  .compose(tap)
  .pipe(process.stdout);
