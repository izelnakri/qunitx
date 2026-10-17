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

if (typeof (globalThis as Record<string, unknown>)['document'] === 'undefined') {
  module('TestContext.finish - zero assertions branch', function (hooks) {
    hooks.beforeEach(function (assert) {
      const originalPushResult = assert.pushResult;
      assert.pushResult = function (resultInfo) {
        resultInfo.result = !resultInfo.result;
        return originalPushResult.call(this, resultInfo);
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
        return originalPushResult.call(this, resultInfo);
      };
    });

    test('finish triggers error when steps are not verified', function (assert) {
      // Use ok() to get totalExecutedAssertions > 0 (ok doesn't call pushResult).
      assert.ok(true);
      // assert.step() records the step without pushing an assertion of its own.
      assert.step('unverified step');
      // finish() will see steps.length > 0 and call pushResult({result: false}),
      // which the beforeEach invert converts to a passing result.
    });
  });

  module('TestContext.finish - QUnit 2 step count branch', function (hooks) {
    hooks.beforeEach(function (assert) {
      const originalPushResult = assert.pushResult;
      // Passes only for the failure that explains the QUnit 3 counting change.
      assert.pushResult = function (resultInfo) {
        resultInfo.result =
          !resultInfo.result && /upgrading from QUnit 2/.test(resultInfo.message ?? '');
        return originalPushResult.call(this, resultInfo);
      };
    });

    test('finish explains an expect() count that still includes steps', function (assert) {
      // The count QUnit 2 expected: two steps and the verifySteps() call.
      assert.expect(3);
      assert.step('one');
      assert.step('two');
      // deepEqual() inside verifySteps() bypasses the pushResult override when it passes.
      assert.verifySteps(['one', 'two']);
    });
  });

  module('TestContext.finish - assertion count mismatch branch', function (hooks) {
    hooks.beforeEach(function (assert) {
      const originalPushResult = assert.pushResult;
      assert.pushResult = function (resultInfo) {
        resultInfo.result = !resultInfo.result;
        return originalPushResult.call(this, resultInfo);
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
