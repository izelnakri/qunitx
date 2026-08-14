import { describe, it, module, test } from 'qunitx';

describe('describe/it aliases', function (hooks) {
  hooks.beforeEach(function () {
    this.value = 21;
  });

  it('describe is the same function object as module', function (assert) {
    assert.strictEqual(describe, module, 'describe === module');
  });

  it('it is the same function object as test', function (assert) {
    assert.strictEqual(it, test, 'it === test');
  });

  it('runs hooks registered through describe', function (assert) {
    assert.strictEqual(this.value, 21, 'beforeEach registered via describe ran');
  });

  it('supports async bodies', async function (assert) {
    const result = await Promise.resolve(42);
    assert.strictEqual(result, 42);
  });

  // describe/it interop with module/test — they are the same registry
  describe('interop', function () {
    test('test() inside describe()', function (assert) {
      assert.ok(true);
    });
  });

  module('module with it()', function () {
    it('it() inside module()', function (assert) {
      assert.ok(true);
    });
  });

  describe('nested describe', function () {
    it('nested test runs', function (assert) {
      assert.ok(true);
    });
  });

  // it.skip: body must never execute — if it does, the suite fails
  it.skip('it.skip does not execute its body', function (assert) {
    assert.ok(false, 'it.skip body should never run');
  });

  // it.todo with a failing assertion — must not fail the suite
  it.todo('it.todo does not fail the suite on failing assertion', function (assert) {
    assert.ok(false, 'not yet implemented');
  });

  // Runtime options are forwarded exactly as they are through module/test
  it('it forwards runtimeOptions { skip: true }', { skip: true }, function (assert) {
    assert.ok(false, 'runtimeOptions skip:true body should never run');
  });

  // A regular test after the test-level skip/todo entries — proves execution continues.
  // Declared before the skipped describes below: QUnit's browser runner treats
  // `module.skip()` as opening a module scope, so anything declared after one is
  // absorbed into it and reported as skipped (same in skip-test.ts).
  it('normal test after skip and todo entries still runs', function (assert) {
    assert.ok(true);
  });

  // describe.skip: all tests inside must be skipped
  describe.skip('describe.skip skips all tests inside', function () {
    it('skipped inner test', function (assert) {
      assert.ok(false, 'test inside describe.skip should never run');
    });
  });

  describe('describe forwards runtimeOptions { skip: true }', { skip: true }, function () {
    it('inner test should not run', function (assert) {
      assert.ok(false, 'test inside skip:true describe should never run');
    });
  });
});
