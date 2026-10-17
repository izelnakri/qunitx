// This file is intentionally run as a subprocess by test/timeout-test.ts.
// Both of its tests time out — the subprocess must exit non-zero.
import { config, module, test } from 'qunitx';

module('timeout fires helper', function () {
  test('slow test times out', async function (assert) {
    assert.timeout(30);
    await new Promise<void>(() => {}); // never resolves; timeout fires first
    assert.ok(true, 'should never reach here');
  });
});

module('default timeout fires helper', function (hooks) {
  // config.testTimeout is read as each test starts, so this applies to the test below.
  hooks.before(() => {
    config.testTimeout = 40;
  });

  test('slow test times out without assert.timeout()', async function (assert) {
    await new Promise<void>(() => {}); // never resolves; config.testTimeout fires first
    assert.ok(true, 'should never reach here');
  });
});
