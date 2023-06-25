import "./setup.js";
// import { tap } from 'node:test/reporters';
// import { run } from 'node:test';

// run({
//   concurrency: true,
//   files: [
//     "./test/commands/index.js",
//     "./test/flags/index.js",
//     "./test/inputs/index.js",
//     "./test/setup/index.js",
//   ],
//   // timeout: 20000
// })
//   .compose(tap)
//   .pipe(process.stdout);

import "./commands/index.js";
import "./flags/index.js";
import "./inputs/index.js";
import "./setup/index.js";

