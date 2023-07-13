import { module, test } from 'qunitx';
import process from "node:process";
import fs from 'node:fs';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';

const CWD = process.cwd();
const VERSION = JSON.parse(fs.readFileSync(`${CWD}/package.json`)).version;
const shell = promisify(exec);
const cli = async function(arg = '') {
  if (process.argv[0].includes('deno')) {
    return await shell(`deno run --allow-read --allow-env ${CWD}/deno/cli.js ${arg}`);
  }

  return await shell(`node ${CWD}/cli.js ${arg}`);
}

const printedHelpOutput = `[qunitx v${VERSION}] Usage: qunitx [targets] --$flags

Input options:
- File: $ qunitx test/foo.js
- Folder: $ qunitx test/login
- Globs: $ qunitx test/**/*-test.js
- Combination: $ qunitx test/foo.js test/bar.js test/*-test.js test/logout

Optional flags:
--browser : run qunit tests in chromium with puppeteer instead of node.js(which is the default)
--debug : print console output when tests run in browser
--watch : run the target file or folders, watch them for continuous run and expose http server under localhost
--timeout : change default timeout per test case
--output : folder to distribute built qunitx html and js that a webservers can run[default: tmp]
--failFast : run the target file or folders with immediate abort if a single test fails
--before : run a script before the tests(i.e start a new web server before tests)
--after : run a script after the tests(i.e save test results to a file)

Example: $ qunitx test/foo.ts app/e2e --browser --debug --watch --before=scripts/start-new-webserver.js --after=scripts/write-test-results.js

Commands:
$ qunitx init               # Bootstraps qunitx base html and add qunitx config to package.json if needed
$ qunitx new $testFileName  # Creates a qunitx test file`;

module('Commands | Help tests', () => {
  test('$ qunitx -> prints help text', async (assert) => {
    const { stdout } = await cli();

    console.log(stdout);
    assert.ok(stdout.includes(printedHelpOutput));
  });

  test('$ qunitx print -> prints help text', async (assert) => {
    const { stdout } = await cli('print');

    assert.ok(stdout.includes(printedHelpOutput));
  });

  test('$ qunitx p -> prints help text', async (assert) => {
    const { stdout } = await cli('p');

    assert.ok(stdout.includes(printedHelpOutput));
  });

  test('$ qunitx help -> prints help text', async (assert) => {
    const { stdout } = await cli('help');

    assert.ok(stdout.includes(printedHelpOutput));
  });

  test('$ qunitx h -> prints help text', async (assert) => {
    const { stdout } = await cli('h');

    assert.ok(stdout.includes(printedHelpOutput));
  });
});
