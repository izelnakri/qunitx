import { module, test } from '../../shims/nodejs.js';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';

import { writeTestFolder } from '../helpers/fs-writers.js';
import { assertPassingTestCase, assertFailingTestCase, assertTAPResult } from '../helpers/assert-stdout.js';
import printStdout from '../helpers/print-stdout.js';

const shell = promisify(exec);

module('Folder Input Tests', () => {
  test('works for a single folder input with all passing tests', async (assert) => {
    let folderName = await writeTestFolder({ addFailingTests: false, });

    const { stdout } = await shell(`node cli.js tmp/${folderName}`);

    printStdout(stdout);

    assertPassingTestCase(assert, stdout, { debug: true, moduleName: `${folderName} | first-module-pass` });
    assertPassingTestCase(assert, stdout, { debug: true, moduleName: `${folderName} | second-module-pass` });
    assertTAPResult(assert, stdout, { testCount: 6 });
  });

  test('works for a single folder input with few failing tests', async (assert) => {
    let folderName = await writeTestFolder({ addFailingTests: true });

    try {
      await shell(`node cli.js tmp/${folderName}`);
    } catch (cmd) {
      printStdout(cmd.stdout);

      assertPassingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${folderName} | first-module-pass` });
      assertPassingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${folderName} | second-module-pass` });
      assertFailingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${folderName} | first-module-fail` });
      assertFailingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${folderName} | second-module-fail` });
      assertFailingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${folderName} | third-module-fail` });
      assertTAPResult(assert, cmd.stdout, { testCount: 18, failCount: 9 });
    }
  });

  test('works for a multiple folders input with all passing tests', async (assert) => {
    let firstFolderName = await writeTestFolder({ addFailingTests: false, });
    let secondFolderName = await writeTestFolder({ addFailingTests: false });

    const { stdout } = await shell(`node cli.js tmp/${firstFolderName} tmp/${secondFolderName}`);

    printStdout(stdout);

    assertPassingTestCase(assert, stdout, { debug: true, moduleName: `${firstFolderName} | first-module-pass` });
    assertPassingTestCase(assert, stdout, { debug: true, moduleName: `${firstFolderName} | second-module-pass` });
    assertPassingTestCase(assert, stdout, { debug: true, moduleName: `${secondFolderName} | first-module-pass` });
    assertPassingTestCase(assert, stdout, { debug: true, moduleName: `${secondFolderName} | second-module-pass` });
    assertTAPResult(assert, stdout, { testCount: 12 });
  });

  test('works for a multiple folders input with few failing tests', async (assert) => {
    let firstFolderName = await writeTestFolder({ addFailingTests: true });
    let secondFolderName = await writeTestFolder({ addFailingTests: false });
    let thirdFolderName = await writeTestFolder({ addFailingTests: true });

    try {
      await shell(`node cli.js tmp/${firstFolderName} tmp/${secondFolderName}`);
    } catch (cmd) {
      printStdout(cmd.stdout);

      assertPassingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | first-module-pass` });
      assertPassingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | second-module-pass` });
      assertFailingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | first-module-fail` });
      assertFailingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | second-module-fail` });
      assertFailingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | third-module-fail` });
      assertPassingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${secondFolderName} | first-module-pass` });
      assertPassingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${secondFolderName} | second-module-pass` });
      assertPassingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | first-module-pass` });
      assertPassingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | second-module-pass` });
      assertFailingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | first-module-fail` });
      assertFailingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | second-module-fail` });
      assertFailingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | third-module-fail` });
      assertTAPResult(assert, cmd.stdout, { testCount: 24, failCount: 9 });
    }
  });

  test('works for a single folder input in browser mode with all passing tests', async (assert) => {
    let folderName = await writeTestFolder({ addFailingTests: false, });

    const { stdout } = await shell(`node cli.js tmp/${folderName} --browser`);

    printStdout(stdout);

    assertPassingTestCase(assert, stdout, { debug: false, moduleName: `${folderName} | first-module-pass` });
    assertPassingTestCase(assert, stdout, { debug: false, moduleName: `${folderName} | second-module-pass` });
    assertTAPResult(assert, stdout, { testCount: 6 });
  });

  test('works for a single folder input in browser mode with few failing tests', async (assert) => {
    let folderName = await writeTestFolder({ addFailingTests: true });

    try {
      await shell(`node cli.js tmp/${folderName} --browser`);
    } catch (cmd) {
      printStdout(cmd.stdout);

      assertPassingTestCase(assert, cmd.stdout, { debug: false, moduleName: `${folderName} | first-module-pass` });
      assertPassingTestCase(assert, cmd.stdout, { debug: false, moduleName: `${folderName} | second-module-pass` });
      assertFailingTestCase(assert, cmd.stdout, { debug: false, moduleName: `${folderName} | first-module-fail` });
      assertFailingTestCase(assert, cmd.stdout, { debug: false, moduleName: `${folderName} | second-module-fail` });
      assertFailingTestCase(assert, cmd.stdout, { debug: false, moduleName: `${folderName} | third-module-fail` });
      assertTAPResult(assert, cmd.stdout, { testCount: 18, failCount: 9 });
    }
  });

  test('works for a multiple folders input in browser mode with all passing tests', async (assert) => {
    let firstFolderName = await writeTestFolder({ addFailingTests: false, });
    let secondFolderName = await writeTestFolder({ addFailingTests: false });

    const { stdout } = await shell(`node cli.js tmp/${firstFolderName} tmp/${secondFolderName} --browser`);

    printStdout(stdout);

    assertPassingTestCase(assert, stdout, { debug: false, moduleName: `${firstFolderName} | first-module-pass` });
    assertPassingTestCase(assert, stdout, { debug: false, moduleName: `${firstFolderName} | second-module-pass` });
    assertPassingTestCase(assert, stdout, { debug: false, moduleName: `${secondFolderName} | first-module-pass` });
    assertPassingTestCase(assert, stdout, { debug: false, moduleName: `${secondFolderName} | second-module-pass` });
    assertTAPResult(assert, stdout, { testCount: 12 });
  });

  test('works for a multiple folders input in browser mode with few failing tests', async (assert) => {
    let firstFolderName = await writeTestFolder({ addFailingTests: true });
    let secondFolderName = await writeTestFolder({ addFailingTests: false });
    let thirdFolderName = await writeTestFolder({ addFailingTests: true });

    try {
      await shell(`node cli.js tmp/${firstFolderName} tmp/${secondFolderName} --browser`);
    } catch (cmd) {
      printStdout(cmd.stdout);

      assertPassingTestCase(assert, cmd.stdout, { debug: false, moduleName: `${firstFolderName} | first-module-pass` });
      assertPassingTestCase(assert, cmd.stdout, { debug: false, moduleName: `${firstFolderName} | second-module-pass` });
      assertFailingTestCase(assert, cmd.stdout, { debug: false, moduleName: `${firstFolderName} | first-module-fail` });
      assertFailingTestCase(assert, cmd.stdout, { debug: false, moduleName: `${firstFolderName} | second-module-fail` });
      assertFailingTestCase(assert, cmd.stdout, { debug: false, moduleName: `${firstFolderName} | third-module-fail` });
      assertPassingTestCase(assert, cmd.stdout, { debug: false, moduleName: `${secondFolderName} | first-module-pass` });
      assertPassingTestCase(assert, cmd.stdout, { debug: false, moduleName: `${secondFolderName} | second-module-pass` });
      assertPassingTestCase(assert, cmd.stdout, { debug: false, moduleName: `${thirdFolderName} | first-module-pass` });
      assertPassingTestCase(assert, cmd.stdout, { debug: false, moduleName: `${thirdFolderName} | second-module-pass` });
      assertFailingTestCase(assert, cmd.stdout, { debug: false, moduleName: `${thirdFolderName} | first-module-fail` });
      assertFailingTestCase(assert, cmd.stdout, { debug: false, moduleName: `${thirdFolderName} | second-module-fail` });
      assertFailingTestCase(assert, cmd.stdout, { debug: false, moduleName: `${thirdFolderName} | third-module-fail` });
      assertTAPResult(assert, cmd.stdout, { testCount: 24, failCount: 9 });
    }
  });

  test('works for a single folder input in browser mode with debug and all passing tests', async (assert) => {
    let folderName = await writeTestFolder({ addFailingTests: false, });

    const { stdout } = await shell(`node cli.js tmp/${folderName} --browser --debug`);

    printStdout(stdout);

    assertPassingTestCase(assert, stdout, { debug: true, moduleName: `${folderName} | first-module-pass` });
    assertPassingTestCase(assert, stdout, { debug: true, moduleName: `${folderName} | second-module-pass` });
    assertTAPResult(assert, stdout, { testCount: 6 });
  });

  test('works for a single folder input in browser mode with debug and few failing tests', async (assert) => {
    let folderName = await writeTestFolder({ addFailingTests: true });

    try {
      await shell(`node cli.js tmp/${folderName} --browser --debug`);
    } catch (cmd) {
      printStdout(cmd.stdout);

      assertPassingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${folderName} | first-module-pass` });
      assertPassingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${folderName} | second-module-pass` });
      assertFailingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${folderName} | first-module-fail` });
      assertFailingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${folderName} | second-module-fail` });
      assertFailingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${folderName} | third-module-fail` });
      assertTAPResult(assert, cmd.stdout, { testCount: 18, failCount: 9 });
    }
  });

  test('works for a multiple folders input in browser mode with debug and all passing tests', async (assert) => {
    let firstFolderName = await writeTestFolder({ addFailingTests: false, });
    let secondFolderName = await writeTestFolder({ addFailingTests: false });

    const { stdout } = await shell(`node cli.js tmp/${firstFolderName} tmp/${secondFolderName} --browser --debug`);

    printStdout(stdout);

    assertPassingTestCase(assert, stdout, { debug: true, moduleName: `${firstFolderName} | first-module-pass` });
    assertPassingTestCase(assert, stdout, { debug: true, moduleName: `${firstFolderName} | second-module-pass` });
    assertPassingTestCase(assert, stdout, { debug: true, moduleName: `${secondFolderName} | first-module-pass` });
    assertPassingTestCase(assert, stdout, { debug: true, moduleName: `${secondFolderName} | second-module-pass` });
    assertTAPResult(assert, stdout, { testCount: 12 });
  });

  test('works for a multiple folders input in browser mode with debug and few failing tests', async (assert) => {
    let firstFolderName = await writeTestFolder({ addFailingTests: true });
    let secondFolderName = await writeTestFolder({ addFailingTests: false });
    let thirdFolderName = await writeTestFolder({ addFailingTests: true });

    try {
      await shell(`node cli.js tmp/${firstFolderName} tmp/${secondFolderName} --browser --debug`);
    } catch (cmd) {
      printStdout(cmd.stdout);

      assertPassingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | first-module-pass` });
      assertPassingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | second-module-pass` });
      assertFailingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | first-module-fail` });
      assertFailingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | second-module-fail` });
      assertFailingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | third-module-fail` });
      assertPassingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${secondFolderName} | first-module-pass` });
      assertPassingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${secondFolderName} | second-module-pass` });
      assertPassingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | first-module-pass` });
      assertPassingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | second-module-pass` });
      assertFailingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | first-module-fail` });
      assertFailingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | second-module-fail` });
      assertFailingTestCase(assert, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | third-module-fail` });
      assertTAPResult(assert, cmd.stdout, { testCount: 24, failCount: 9 });
    }
  });
});
