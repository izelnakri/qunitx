import { module, test } from 'qunitx';

// These tests cover finish() branches in the custom Node.js/Deno TestContext shim.
// They rely on assertions throwing on failure, which does not apply to the QUnit
// browser shim. All module definitions are guarded for non-browser environments.
// Use `document` (not `window`) as the browser guard — Deno exposes `window` in
// some versions for web-compat but never exposes `document`.
//
// finish() is called in afterAll after all tests in a module complete.
// We use the beforeEach invert trick so that when finish() calls
// pushResult({result: false}), the invert turns it into a passing result.

if (typeof document === 'undefined') {
  module('TestContext.finish - zero assertions branch', function (hooks) {
    hooks.beforeEach(function (assert) {
      const originalPushResult = assert.pushResult;
      assert.pushResult = function (resultInfo) {
        resultInfo.result = !resultInfo.result;
        originalPushResult.call(this, resultInfo);
      };
    });

    test('finish triggers error when no assertions run', function () {
      // Intentionally empty - totalExecutedAssertions stays 0.
      // finish() detects this and calls pushResult({result: false}),
      // which the beforeEach invert converts to a passing result.
    });
  });

  module('TestContext.finish - unverified steps branch', function (hooks) {
    hooks.beforeEach(function (assert) {
      const originalPushResult = assert.pushResult;
      assert.pushResult = function (resultInfo) {
        resultInfo.result = !resultInfo.result;
        originalPushResult.call(this, resultInfo);
      };
    });

    test('finish triggers error when steps are not verified', function (assert) {
      // Use ok() to get totalExecutedAssertions > 0 (ok doesn't call pushResult).
      assert.ok(true);
      // Push directly to steps array to avoid going through assert.step()
      // which calls pushResult and would be inverted to a failure.
      assert.test.steps.push('unverified step');
      // finish() will see steps.length > 0 and call pushResult({result: false}),
      // which the beforeEach invert converts to a passing result.
    });
  });

  module('TestContext.finish - assertion count mismatch branch', function (hooks) {
    hooks.beforeEach(function (assert) {
      const originalPushResult = assert.pushResult;
      assert.pushResult = function (resultInfo) {
        resultInfo.result = !resultInfo.result;
        originalPushResult.call(this, resultInfo);
      };
    });

    test('finish triggers error when actual count differs from expected', function (assert) {
      // assert.expect() sets expectedAssertionCount without calling pushResult.
      assert.expect(5);
      // Run only 1 assertion (ok doesn't call pushResult, safe with invert).
      assert.ok(true);
      // finish() sees expectedAssertionCount(5) !== totalExecutedAssertions(1)
      // and calls pushResult({result: false}),
      // which the beforeEach invert converts to a passing result.
    });
  });
}
