import { module, test } from 'qunitx';
import { assertPassingTestCase, assertFailingTestCase, assertTAPResult } from '../helpers/assert-stdout.js';
import shell from '../helpers/shell.js';

module('--before script tests for browser mode', { concurrency: false }, (_hooks, moduleMetadata) => {
  test('--before works when it doesnt need to be awaited', async (assert, testMetadata) => {
    const { stdout } = await shell('node cli.js test/helpers/passing-tests.js --before=test/helpers/before-script-basic.js', { ...moduleMetadata, ...testMetadata });

    assert.ok(stdout.includes('This is running from before script!!'));
    assertPassingTestCase(assert, stdout, { testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });

  test('--before works it needs to be awaited', { concurrency: false }, async (assert, testMetadata) => {
    const { stdout } = await shell('node cli.js test/helpers/passing-tests.js test/helpers/before-script-web-server-tests.js --before=test/helpers/before-script-async.js', { ...moduleMetadata, ...testMetadata });

    assert.ok(stdout.includes('This is running from before script!!'));
    assert.ok(stdout.includes('Starting before script with:'));
    assertPassingTestCase(assert, stdout, { testNo: 1, moduleName: '{{moduleName}}' });
    assertPassingTestCase(assert, stdout, { testNo: 4, moduleName: '{{moduleName}} Before script web server tests' });
    assertTAPResult(assert, stdout, { testCount: 4 });
  });
});
