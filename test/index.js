import "./setup.js";
import { tap } from 'node:test/reporters';
import { run } from 'node:test';

// TODO: make this file a direct import and utilize node --test flags/options when you can with Node.js v20+
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
