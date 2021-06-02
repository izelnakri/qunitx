import assert from 'assert';
import fs from 'fs/promises';
import { promisify } from 'util';
import { exec } from 'child_process';
import { assertPassingTestCase, assertFailingTestCase, assertTAPResult } from '../helpers/assert-stdout.js';

const shell = promisify(exec);

describe('--before script tests', () => {
  it('--before works when it doesnt need to be awaited', async function () {
    const { stdout } = await shell('node cli.js test/helpers/passing-tests.js --before=test/helpers/before-script-basic.js');

    assert.ok(stdout.includes('This is running from before script!!'));
    assertPassingTestCase(assert, stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });

  it('--before works for --browser mode when it doesnt need to be awaited', async function () {
    const { stdout } = await shell('node cli.js test/helpers/passing-tests.js --browser --before=test/helpers/before-script-basic.js');

    assert.ok(stdout.includes('This is running from before script!!'));
    assertPassingTestCase(assert, stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });

  it('--before works it needs to be awaited', async function () {
    const { stdout } = await shell('node cli.js test/helpers/passing-tests.js test/helpers/before-script-web-server-tests.js --before=test/helpers/before-script-async.js');

    assert.ok(stdout.includes('This is running from before script!!'));
    assert.ok(stdout.includes('Starting before script with:'));
    assert.ok(stdout.includes('Web server started on port 4000'));
    assertPassingTestCase(assert, stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
    assertPassingTestCase(assert, stdout, { debug: true, testNo: 4, moduleName: '{{moduleName}} Before script web server tests' });
    assertTAPResult(assert, stdout, { testCount: 4 });
  });

  it('--before works for --browser mode it needs to be awaited', async function () {
    const { stdout } = await shell('node cli.js test/helpers/passing-tests.js test/helpers/before-script-web-server-tests.js --browser --before=test/helpers/before-script-async.js');

    assert.ok(stdout.includes('This is running from before script!!'));
    assert.ok(stdout.includes('Starting before script with:'));
    assert.ok(stdout.includes('Web server started on port 4000'));
    assertPassingTestCase(assert, stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
    assertPassingTestCase(assert, stdout, { debug: true, testNo: 4, moduleName: '{{moduleName}} Before script web server tests' });
    assertTAPResult(assert, stdout, { testCount: 4 });
  });
});
