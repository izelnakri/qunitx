/**
 * Type-checked, never run, by scripts/test-release.sh against the installed tarball, the
 * way a strict TypeScript consumer would (`skipLibCheck: false`), with tsc and deno check.
 * Every named export is used as the value it is: the declarations once re-exported
 * `Assert` and `config` as types only, which no runtime test could notice.
 */
import qunitx, { Assert, config, describe, it, module, skip, test, todo } from 'qunitx';
import BaseAssert from 'qunitx/assert';

config.testTimeout = 5_000;
const assertClass: typeof BaseAssert = Assert;
const shorthands = [describe, it, skip, todo, qunitx.module, qunitx.test];

module('types', (hooks, { context }) => {
  hooks.before(() => {
    context.started = assertClass === Assert && shorthands.length > 0;
  });

  test('assertions', (assert) => {
    assert.expect(1);
    const expected: number | undefined = assert.expect();
    assert.ok(expected);
  });
});
