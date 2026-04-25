// This file is intentionally run as a subprocess by test/location-test.ts.
// It has a test that fails — the subprocess exits non-zero and the location
// reported by the runner should point to THIS file, not qunitx's dist directory.
import { module, test } from 'qunitx';

module('location fixture', function () {
  test('deliberate failure', function (assert) {
    assert.ok(false, 'intentional failure for location test');
  });
});
