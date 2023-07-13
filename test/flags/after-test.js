import { module, test } from 'qunitx';
import { assertPassingTestCase, assertFailingTestCase, assertTAPResult } from '../helpers/assert-stdout.js';
import shell from '../helpers/shell.js';

module('--after script tests for browser mode', { concurrency: false }, (_hooks, moduleMetadata) => {
  test('--after works when it doesnt need to be awaited', async (assert, testMetadata) => {
    const { stdout } = await shell('node cli.js test/helpers/passing-tests.js --after=test/helpers/after-script-basic.js', { ...moduleMetadata, ...testMetadata });

    assert.ok(stdout.includes('This is running from after script!!'));
    assertPassingTestCase(assert, stdout, { debug: false, testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });

  test('--after works when it needs to be awaited', async (assert, testMetadata) => {
    const { stdout } = await shell('node cli.js test/helpers/passing-tests.js --after=test/helpers/after-script-async.js', { ...moduleMetadata, ...testMetadata });

    assert.ok(stdout.includes('This is running from after script!!'));
    assert.ok(stdout.includes('After script result is written:'));
    assert.ok(stdout.includes(JSON.stringify({ testCount: 3, failCount: 0, skipCount: 0, passCount: 3 }, null, 2)));
    assertPassingTestCase(assert, stdout, { testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });
});
