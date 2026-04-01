// Imported by scripts/test-release.sh from a throwaway consumer directory that
// has qunitx installed from the npm pack tarball — not from local source.
// Verifies the published artefact's public API works on every supported runtime.
import { module, test, Assert } from 'qunitx';

module('release consumer', (hooks) => {
  hooks.before((assert: Assert) => {
    assert.ok(true, 'before hook ran');
  });

  test('basic assertion', (assert: Assert) => {
    assert.equal(1 + 1, 2);
  });

  test('async test', async (assert: Assert) => {
    const value = await Promise.resolve(42);
    assert.strictEqual(value, 42);
  });

  test('deepEqual', (assert: Assert) => {
    assert.deepEqual({ a: 1 }, { a: 1 });
  });
});
