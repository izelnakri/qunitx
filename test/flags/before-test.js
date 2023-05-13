import { module, test } from '../../shims/nodejs.js';
import { assertPassingTestCase, assertFailingTestCase, assertTAPResult } from '../helpers/assert-stdout.js';
import shell from '../helpers/shell.js';

module('--before script tests', (_hooks, moduleMetadata) => {
  test('--before works when it doesnt need to be awaited', async (assert, testMetadata) => {
    const { stdout } = await shell('node cli.js test/helpers/passing-tests.js --before=test/helpers/before-script-basic.js', { ...moduleMetadata, ...testMetadata });

    assert.ok(stdout.includes('This is running from before script!!'));
    assertPassingTestCase(assert, stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });

  test('--before works for --browser mode when it doesnt need to be awaited', async (assert, testMetadata) => {
    const { stdout } = await shell('node cli.js test/helpers/passing-tests.js --browser --before=test/helpers/before-script-basic.js', { ...moduleMetadata, ...testMetadata });

    assert.ok(stdout.includes('This is running from before script!!'));
    assertPassingTestCase(assert, stdout, { debug: false, testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });

  test('--before works it needs to be awaited', async (assert, testMetadata) => {
    const { stdout } = await shell('node cli.js test/helpers/passing-tests.js test/helpers/before-script-web-server-tests.js --before=test/helpers/before-script-async.js', { ...moduleMetadata, ...testMetadata });

    assert.ok(stdout.includes('This is running from before script!!'));
    assert.ok(stdout.includes('Starting before script with:'));
    assertPassingTestCase(assert, stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
    assertPassingTestCase(assert, stdout, { debug: true, testNo: 4, moduleName: '{{moduleName}} Before script web server tests' });
    assertTAPResult(assert, stdout, { testCount: 4 });
  });

  test('--before works for --browser mode it needs to be awaited', async (assert, testMetadata) => {
    const { stdout } = await shell('node cli.js test/helpers/passing-tests.js test/helpers/before-script-web-server-tests.js --browser --before=test/helpers/before-script-async.js', { ...moduleMetadata, ...testMetadata });

    assert.ok(stdout.includes('This is running from before script!!'));
    assert.ok(stdout.includes('Starting before script with:'));
    assertPassingTestCase(assert, stdout, { debug: false, testNo: 1, moduleName: '{{moduleName}}' });
    assertPassingTestCase(assert, stdout, { debug: false, testNo: 4, moduleName: '{{moduleName}} Before script web server tests' });
    assertTAPResult(assert, stdout, { testCount: 4 });
  });
});
