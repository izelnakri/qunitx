import assert from 'assert';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

const shell = promisify(exec);
const VERSION = JSON.parse(fs.readFileSync(`${process.cwd()}/package.json`)).version;
const printedHelpOutput = `[qunitx v${VERSION}] Usage: qunitx [targets] --$flags

Input options:
- File: $ qunitx test/foo.js
- Folder: $ qunitx test/login
- Combination: $ qunitx test/foo.js test/bar.js test/logout

Optional flags:
--browser : run qunit tests in chromium with puppeteer instead of node.js(which is the default)
--debug : print console output when tests run in browser
--watch : run the target file or folders and watch them for continuous run
--timeout : change default timeout per test case
--outputPath : folder to distribute built qunitx html and js that a webservers can run[default: tmp]
--failFast : run the target file or folders with immediate abort if a single test fails

Example: $ qunitx test/foo.ts app/e2e --browser --debug --watch

Commands:
$ qunitx init               # Bootstraps qunitx base html and add qunitx config to package.json if needed
$ qunitx new $testFileName  # Creates a qunitx test file`;

describe('Commands | Help tests', function() {
  it('$ qunitx -> prints help text', async function() {
    const { stdout } = await shell(`node ${process.cwd()}/cli.js`);

    assert.ok(stdout.includes(printedHelpOutput));
  });

  it('$ qunitx print -> prints help text', async function() {
    const { stdout } = await shell(`node ${process.cwd()}/cli.js print`);

    assert.ok(stdout.includes(printedHelpOutput));
  });

  it('$ qunitx p -> prints help text', async function() {
    const { stdout } = await shell(`node ${process.cwd()}/cli.js p`);

    assert.ok(stdout.includes(printedHelpOutput));
  });

  it('$ qunitx help -> prints help text', async function() {
    const { stdout } = await shell(`node ${process.cwd()}/cli.js help`);

    assert.ok(stdout.includes(printedHelpOutput));
  });

  it('$ qunitx h -> prints help text', async function() {
    const { stdout } = await shell(`node ${process.cwd()}/cli.js h`);

    assert.ok(stdout.includes(printedHelpOutput));
  });
});

// it('$ qunitx unknown -> raises error', async function() {
//   t.plan(2);

//   try {
//     await shell(`node ${process.cwd()}/cli.js dasd`);
//   } catch ({ stdout }) {
//     assert.ok(stdout.includes('qunitx unknown command. Available options are:'));
//     assert.ok(stdout.includes(printedHelpOutput));
//   }
// });
