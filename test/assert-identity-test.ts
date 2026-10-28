import { module, test } from 'qunitx';

// Regression: the deno entry used to inline its own _Assert class, so
// `Assert.prototype.<name> = ...` extensions made via `qunitx/assert` were
// invisible to tests imported from `qunitx`. Both entries must expose the
// same class identity for prototype extensions to take effect.
//
// Guarded for browser: there `Assert` from qunitx is QUnit's own class, which the
// browser runs tests with, not the one `qunitx/assert` exports. This regression only
// applies to the node and deno entries.
if (typeof (globalThis as Record<string, unknown>)['document'] === 'undefined') {
  module('Assert class identity across entries', function () {
    test('Assert from qunitx === default from qunitx/assert', async function (assert) {
      const [{ Assert }, { default: SharedAssert }] = await Promise.all([
        import('qunitx'),
        import('qunitx/assert'),
      ]);
      assert.strictEqual(Assert, SharedAssert);
    });

    test('prototype extension via qunitx/assert is visible to test assert', async function (assert) {
      const { default: SharedAssert } = await import('qunitx/assert');
      const marker = Symbol('identity-extension');
      (SharedAssert.prototype as unknown as { __identityMarker: symbol }).__identityMarker = marker;
      try {
        assert.strictEqual(
          (assert as unknown as { __identityMarker: symbol }).__identityMarker,
          marker,
        );
      } finally {
        delete (SharedAssert.prototype as unknown as { __identityMarker?: symbol })
          .__identityMarker;
      }
    });
  });
}
