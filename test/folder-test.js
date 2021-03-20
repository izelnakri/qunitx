import test from 'ava';
import { promisify } from 'util';
import { exec } from 'child_process';

import { writeTestFolder } from './helpers/fs-writers.js';
import { assertPassingTestCase, assertFailingTestCase, assertTAPResult } from './helpers/assert-stdout.js';

const shell = promisify(exec);

test('works for a single folder input with all passing tests', async (t) => {
  let folderName = await writeTestFolder({ addFailingTests: false, });

  const { stdout } = await shell(`node cli.js tmp/${folderName}`);

  console.log(stdout);

  assertPassingTestCase(t, stdout, { debug: true, moduleName: `${folderName} | first-module-pass` });
  assertPassingTestCase(t, stdout, { debug: true, moduleName: `${folderName} | second-module-pass` });
  assertTAPResult(t, stdout, { testCount: 6 });
});

test('works for a single folder input with few failing tests', async (t) => {
  let folderName = await writeTestFolder({ addFailingTests: true });

  try {
    await shell(`node cli.js tmp/${folderName}`);
  } catch (cmd) {
    console.log(cmd.stdout);

    assertPassingTestCase(t, cmd.stdout, { debug: true, moduleName: `${folderName} | first-module-pass` });
    assertPassingTestCase(t, cmd.stdout, { debug: true, moduleName: `${folderName} | second-module-pass` });
    assertFailingTestCase(t, cmd.stdout, { debug: true, moduleName: `${folderName} | first-module-fail` });
    assertFailingTestCase(t, cmd.stdout, { debug: true, moduleName: `${folderName} | second-module-fail` });
    assertFailingTestCase(t, cmd.stdout, { debug: true, moduleName: `${folderName} | third-module-fail` });
    assertTAPResult(t, cmd.stdout, { testCount: 18, failCount: 9 });
  }
});

test('works for a multiple folders input with all passing tests', async (t) => {
  let firstFolderName = await writeTestFolder({ addFailingTests: false, });
  let secondFolderName = await writeTestFolder({ addFailingTests: false });

  const { stdout } = await shell(`node cli.js tmp/${firstFolderName} tmp/${secondFolderName}`);

  console.log(stdout);

  assertPassingTestCase(t, stdout, { debug: true, moduleName: `${firstFolderName} | first-module-pass` });
  assertPassingTestCase(t, stdout, { debug: true, moduleName: `${firstFolderName} | second-module-pass` });
  assertPassingTestCase(t, stdout, { debug: true, moduleName: `${secondFolderName} | first-module-pass` });
  assertPassingTestCase(t, stdout, { debug: true, moduleName: `${secondFolderName} | second-module-pass` });
  assertTAPResult(t, stdout, { testCount: 12 });
});

test('works for a multiple folders input with few failing tests', async (t) => {
  let firstFolderName = await writeTestFolder({ addFailingTests: true });
  let secondFolderName = await writeTestFolder({ addFailingTests: false });
  let thirdFolderName = await writeTestFolder({ addFailingTests: true });

  try {
    await shell(`node cli.js tmp/${firstFolderName} tmp/${secondFolderName}`);
  } catch (cmd) {
    console.log(cmd.stdout);

    assertPassingTestCase(t, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | first-module-pass` });
    assertPassingTestCase(t, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | second-module-pass` });
    assertFailingTestCase(t, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | first-module-fail` });
    assertFailingTestCase(t, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | second-module-fail` });
    assertFailingTestCase(t, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | third-module-fail` });
    assertPassingTestCase(t, cmd.stdout, { debug: true, moduleName: `${secondFolderName} | first-module-pass` });
    assertPassingTestCase(t, cmd.stdout, { debug: true, moduleName: `${secondFolderName} | second-module-pass` });
    assertPassingTestCase(t, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | first-module-pass` });
    assertPassingTestCase(t, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | second-module-pass` });
    assertFailingTestCase(t, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | first-module-fail` });
    assertFailingTestCase(t, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | second-module-fail` });
    assertFailingTestCase(t, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | third-module-fail` });
    assertTAPResult(t, cmd.stdout, { testCount: 24, failCount: 9 });
  }
});

test('works for a single folder input in browser mode with all passing tests', async (t) => {
  let folderName = await writeTestFolder({ addFailingTests: false, });

  const { stdout } = await shell(`node cli.js tmp/${folderName} --browser`);

  console.log(stdout);

  assertPassingTestCase(t, stdout, { debug: false, moduleName: `${folderName} | first-module-pass` });
  assertPassingTestCase(t, stdout, { debug: false, moduleName: `${folderName} | second-module-pass` });
  assertTAPResult(t, stdout, { testCount: 6 });
});

test('works for a single folder input in browser mode with few failing tests', async (t) => {
  let folderName = await writeTestFolder({ addFailingTests: true });

  try {
    await shell(`node cli.js tmp/${folderName} --browser`);
  } catch (cmd) {
    console.log(cmd.stdout);

    assertPassingTestCase(t, cmd.stdout, { debug: false, moduleName: `${folderName} | first-module-pass` });
    assertPassingTestCase(t, cmd.stdout, { debug: false, moduleName: `${folderName} | second-module-pass` });
    assertFailingTestCase(t, cmd.stdout, { debug: false, moduleName: `${folderName} | first-module-fail` });
    assertFailingTestCase(t, cmd.stdout, { debug: false, moduleName: `${folderName} | second-module-fail` });
    assertFailingTestCase(t, cmd.stdout, { debug: false, moduleName: `${folderName} | third-module-fail` });
    assertTAPResult(t, cmd.stdout, { testCount: 18, failCount: 9 });
  }
});

test('works for a multiple folders input in browser mode with all passing tests', async (t) => {
  let firstFolderName = await writeTestFolder({ addFailingTests: false, });
  let secondFolderName = await writeTestFolder({ addFailingTests: false });

  const { stdout } = await shell(`node cli.js tmp/${firstFolderName} tmp/${secondFolderName} --browser`);

  console.log(stdout);

  assertPassingTestCase(t, stdout, { debug: false, moduleName: `${firstFolderName} | first-module-pass` });
  assertPassingTestCase(t, stdout, { debug: false, moduleName: `${firstFolderName} | second-module-pass` });
  assertPassingTestCase(t, stdout, { debug: false, moduleName: `${secondFolderName} | first-module-pass` });
  assertPassingTestCase(t, stdout, { debug: false, moduleName: `${secondFolderName} | second-module-pass` });
  assertTAPResult(t, stdout, { testCount: 12 });
});

test('works for a multiple folders input in browser mode with few failing tests', async (t) => {
  let firstFolderName = await writeTestFolder({ addFailingTests: true });
  let secondFolderName = await writeTestFolder({ addFailingTests: false });
  let thirdFolderName = await writeTestFolder({ addFailingTests: true });

  try {
    await shell(`node cli.js tmp/${firstFolderName} tmp/${secondFolderName} --browser`);
  } catch (cmd) {
    console.log(cmd.stdout);

    assertPassingTestCase(t, cmd.stdout, { debug: false, moduleName: `${firstFolderName} | first-module-pass` });
    assertPassingTestCase(t, cmd.stdout, { debug: false, moduleName: `${firstFolderName} | second-module-pass` });
    assertFailingTestCase(t, cmd.stdout, { debug: false, moduleName: `${firstFolderName} | first-module-fail` });
    assertFailingTestCase(t, cmd.stdout, { debug: false, moduleName: `${firstFolderName} | second-module-fail` });
    assertFailingTestCase(t, cmd.stdout, { debug: false, moduleName: `${firstFolderName} | third-module-fail` });
    assertPassingTestCase(t, cmd.stdout, { debug: false, moduleName: `${secondFolderName} | first-module-pass` });
    assertPassingTestCase(t, cmd.stdout, { debug: false, moduleName: `${secondFolderName} | second-module-pass` });
    assertPassingTestCase(t, cmd.stdout, { debug: false, moduleName: `${thirdFolderName} | first-module-pass` });
    assertPassingTestCase(t, cmd.stdout, { debug: false, moduleName: `${thirdFolderName} | second-module-pass` });
    assertFailingTestCase(t, cmd.stdout, { debug: false, moduleName: `${thirdFolderName} | first-module-fail` });
    assertFailingTestCase(t, cmd.stdout, { debug: false, moduleName: `${thirdFolderName} | second-module-fail` });
    assertFailingTestCase(t, cmd.stdout, { debug: false, moduleName: `${thirdFolderName} | third-module-fail` });
    assertTAPResult(t, cmd.stdout, { testCount: 24, failCount: 9 });
  }
});

test('works for a single folder input in browser mode with debug and all passing tests', async (t) => {
  let folderName = await writeTestFolder({ addFailingTests: false, });

  const { stdout } = await shell(`node cli.js tmp/${folderName} --browser --debug`);

  console.log(stdout);

  assertPassingTestCase(t, stdout, { debug: true, moduleName: `${folderName} | first-module-pass` });
  assertPassingTestCase(t, stdout, { debug: true, moduleName: `${folderName} | second-module-pass` });
  assertTAPResult(t, stdout, { testCount: 6 });
});

test('works for a single folder input in browser mode with debug and few failing tests', async (t) => {
  let folderName = await writeTestFolder({ addFailingTests: true });

  try {
    await shell(`node cli.js tmp/${folderName} --browser --debug`);
  } catch (cmd) {
    console.log(cmd.stdout);

    assertPassingTestCase(t, cmd.stdout, { debug: true, moduleName: `${folderName} | first-module-pass` });
    assertPassingTestCase(t, cmd.stdout, { debug: true, moduleName: `${folderName} | second-module-pass` });
    assertFailingTestCase(t, cmd.stdout, { debug: true, moduleName: `${folderName} | first-module-fail` });
    assertFailingTestCase(t, cmd.stdout, { debug: true, moduleName: `${folderName} | second-module-fail` });
    assertFailingTestCase(t, cmd.stdout, { debug: true, moduleName: `${folderName} | third-module-fail` });
    assertTAPResult(t, cmd.stdout, { testCount: 18, failCount: 9 });
  }
});

test('works for a multiple folders input in browser mode with debug and all passing tests', async (t) => {
  let firstFolderName = await writeTestFolder({ addFailingTests: false, });
  let secondFolderName = await writeTestFolder({ addFailingTests: false });

  const { stdout } = await shell(`node cli.js tmp/${firstFolderName} tmp/${secondFolderName} --browser --debug`);

  console.log(stdout);

  assertPassingTestCase(t, stdout, { debug: true, moduleName: `${firstFolderName} | first-module-pass` });
  assertPassingTestCase(t, stdout, { debug: true, moduleName: `${firstFolderName} | second-module-pass` });
  assertPassingTestCase(t, stdout, { debug: true, moduleName: `${secondFolderName} | first-module-pass` });
  assertPassingTestCase(t, stdout, { debug: true, moduleName: `${secondFolderName} | second-module-pass` });
  assertTAPResult(t, stdout, { testCount: 12 });
});

test('works for a multiple folders input in browser mode with debug and few failing tests', async (t) => {
  let firstFolderName = await writeTestFolder({ addFailingTests: true });
  let secondFolderName = await writeTestFolder({ addFailingTests: false });
  let thirdFolderName = await writeTestFolder({ addFailingTests: true });

  try {
    await shell(`node cli.js tmp/${firstFolderName} tmp/${secondFolderName} --browser --debug`);
  } catch (cmd) {
    console.log(cmd.stdout);

    assertPassingTestCase(t, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | first-module-pass` });
    assertPassingTestCase(t, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | second-module-pass` });
    assertFailingTestCase(t, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | first-module-fail` });
    assertFailingTestCase(t, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | second-module-fail` });
    assertFailingTestCase(t, cmd.stdout, { debug: true, moduleName: `${firstFolderName} | third-module-fail` });
    assertPassingTestCase(t, cmd.stdout, { debug: true, moduleName: `${secondFolderName} | first-module-pass` });
    assertPassingTestCase(t, cmd.stdout, { debug: true, moduleName: `${secondFolderName} | second-module-pass` });
    assertPassingTestCase(t, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | first-module-pass` });
    assertPassingTestCase(t, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | second-module-pass` });
    assertFailingTestCase(t, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | first-module-fail` });
    assertFailingTestCase(t, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | second-module-fail` });
    assertFailingTestCase(t, cmd.stdout, { debug: true, moduleName: `${thirdFolderName} | third-module-fail` });
    assertTAPResult(t, cmd.stdout, { testCount: 24, failCount: 9 });
  }
});
