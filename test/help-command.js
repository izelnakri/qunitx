import test from 'ava';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

const shell = promisify(exec);
const VERSION = JSON.parse(fs.readFileSync(`${process.cwd()}/package.json`)).version;
const printedHelpOutput = `[qunitx v${VERSION}] Usage: qunitx [targets] --$flags

Input options:
- File: $ qunitx test/foo.js
- Folder: $ qunitx test/login
- Glob: $ qunitx test/**/*.ts
- Regex: $ qunit *-test.ts
- Combination: $ qunit test/foo.js test/bar.js test/logout app/e2e/submit-*.ts

Optional flags:
--browser [default] : run qunit tests in chromium instead of node.js(with puppeteer)
--node : run qunit tests in node.js without spawning a chromium/puppeteer
--debug : print console output when tests run in browser
--watch : run the target file or folders and watch them for continuous run
--failFast : run the target file or folders with immediate abort if a single test fails
--reporter : define a reporter
--coverage : define a coverage dist folder target(by default ./dist)

Example: $ qunitx test/foo.ts#204 app/e2e --debug --watch
`;

test('$ qunitx -> prints help text', async (t) => {
  const { stdout } = await shell(`node ${process.cwd()}/cli.js`);

  t.true(stdout.includes(printedHelpOutput));
});

test('$ qunitx print -> prints help text', async (t) => {
  const { stdout } = await shell(`node ${process.cwd()}/cli.js print`);

  t.true(stdout.includes(printedHelpOutput));
});

test('$ qunitx p -> prints help text', async (t) => {
  const { stdout } = await shell(`node ${process.cwd()}/cli.js p`);

  t.true(stdout.includes(printedHelpOutput));
});

test('$ qunitx help -> prints help text', async (t) => {
  const { stdout } = await shell(`node ${process.cwd()}/cli.js help`);

  t.true(stdout.includes(printedHelpOutput));
});

test('$ qunitx h -> prints help text', async (t) => {
  const { stdout } = await shell(`node ${process.cwd()}/cli.js h`);

  t.true(stdout.includes(printedHelpOutput));
});

// test('$ qunitx unknown -> raises error', async (t) => {
//   t.plan(2);

//   try {
//     await shell(`node ${process.cwd()}/cli.js dasd`);
//   } catch ({ stdout }) {
//     t.true(stdout.includes('qunitx unknown command. Available options are:'));
//     t.true(stdout.includes(printedHelpOutput));
//   }
// });
