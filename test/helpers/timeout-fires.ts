// This file is intentionally run as a subprocess by test/timeout-test.ts.
// It has a test that times out — the subprocess must exit non-zero.
import { module, test } from 'qunitx';

module('timeout fires helper', function () {
  test('slow test times out', async function (assert) {
    assert.timeout(30);
    await new Promise<void>(() => {}); // never resolves; timeout fires first
    assert.ok(true, 'should never reach here');
  });
});
