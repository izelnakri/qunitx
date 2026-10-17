/**
 * Type-checked, never run, by scripts/test-release.sh against the installed tarball, the
 * way a strict TypeScript consumer would (`skipLibCheck: false`), with tsc and deno check.
 * Every named export is used as the value it is: the declarations once re-exported
 * `Assert` and `config` as types only, which no runtime test could notice.
 */
import qunitx, { Assert, config, describe, hooks, it, module, only, skip, test, todo } from 'qunitx';
import BaseAssert from 'qunitx/assert';

config.testTimeout = 5_000;
hooks.beforeEach((_assert, { context }) => {
  context.ready = true;
});
const assertClass: typeof BaseAssert = Assert;
const shorthands = [describe, it, skip, todo, only, qunitx.module, qunitx.test];

module('types', (moduleHooks, { context }) => {
  moduleHooks.before(() => {
    context.started = assertClass === Assert && shorthands.length > 0;
  });

  test('assertions', async (assert) => {
    assert.closeTo(0.1 + 0.2, 0.3, 0.001);
    const thrown: RangeError = assert.throws(() => {
      throw new RangeError('range');
    }, RangeError);
    const rejected: TypeError = await assert.rejects(Promise.reject(new TypeError('type')), TypeError);
    assert.strictEqual(thrown.message + rejected.message, 'rangetype');
    assert.expect(2);
    const expected: number | undefined = assert.expect();
    assert.ok(expected);
  });

  test.each('each', [1, 2], (assert, n: number, { testName }) => assert.ok(n && testName));
  test.if('if', true, (assert) => assert.ok(true));
  test.only('only', (assert) => assert.ok(true));
  test.skip.each('skip.each', [1]);
  test.todo.each('todo.each', { a: 'x' }, (assert, s: string) => assert.ok(s));
  test.if.each('if.each', true, ['a'], (assert, s: string) => assert.ok(s.length));
  test.only.each('only.each', [true], (assert, b: boolean) => assert.true(b));
  module.if('module.if', true, () => {});
  module.only('module.only', { concurrency: false }, () => {});
});
