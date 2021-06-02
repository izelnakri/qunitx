import assert from 'assert';
import fs from 'fs/promises';
import { promisify } from 'util';
import { exec } from 'child_process';
import { assertPassingTestCase, assertFailingTestCase, assertTAPResult } from '../helpers/assert-stdout.js';

const shell = promisify(exec);

describe('--after script tests', () => {
  it('--after works when it doesnt need to be awaited', async function () {
    const { stdout } = await shell('node cli.js test/helpers/passing-tests.js --after=test/helpers/after-script-basic.js');

    assert.ok(stdout.includes('This is running from after script!!'));
    assertPassingTestCase(assert, stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });

  it('--after works for --browser mode when it doesnt need to be awaited', async function () {
    const { stdout } = await shell('node cli.js test/helpers/passing-tests.js --browser --after=test/helpers/after-script-basic.js');

    assert.ok(stdout.includes('This is running from after script!!'));
    assertPassingTestCase(assert, stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });

  it('--after works it needs to be awaited', async function () {
    const { stdout } = await shell('node cli.js test/helpers/passing-tests.js --after=test/helpers/after-script-async.js');

    assert.ok(stdout.includes('This is running from after script!!'));
    assert.ok(stdout.includes('After script result is written:'));
    assert.ok(stdout.includes(JSON.stringify({ testCount: 3, failCount: 0, skipCount: 0, passCount: 3 }, null, 2)));
    assertPassingTestCase(assert, stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });

  it('--after works for --browser mode it needs to be awaited', async function () {
    const { stdout } = await shell('node cli.js test/helpers/passing-tests.js --browser --after=test/helpers/after-script-async.js');

    assert.ok(stdout.includes('This is running from after script!!'));
    assert.ok(stdout.includes('After script result is written:'));
    assert.ok(stdout.includes(JSON.stringify({ testCount: 3, failCount: 0, skipCount: 0, passCount: 3 }, null, 2)));
    assertPassingTestCase(assert, stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });
});
