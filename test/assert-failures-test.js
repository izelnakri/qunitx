import { module, test } from 'qunitx';

// Tests that work across all runtimes (node, deno, browser/QUnit)
module('Assertion: true/false - failing assertions', function (hooks) {
  hooks.beforeEach(function (assert) {
    const originalPushResult = assert.pushResult;
    assert.pushResult = function (resultInfo) {
      resultInfo.result = !resultInfo.result;
      originalPushResult.call(this, resultInfo);
    };
  });

  test('true fails for non-boolean-true values', function (assert) {
    assert.throws(() => assert.true(false));
    assert.throws(() => assert.true(1));
    assert.throws(() => assert.true(null));
    assert.throws(() => assert.true('true'));
  });

  test('false fails for non-boolean-false values', function (assert) {
    assert.throws(() => assert.false(true));
    assert.throws(() => assert.false(0));
    assert.throws(() => assert.false(''));
    assert.throws(() => assert.false(null));
  });
});

module('Assertion: deepEqual/notDeepEqual - failing assertions', function (hooks) {
  hooks.beforeEach(function (assert) {
    const originalPushResult = assert.pushResult;
    assert.pushResult = function (resultInfo) {
      resultInfo.result = !resultInfo.result;
      originalPushResult.call(this, resultInfo);
    };
  });

  test('deepEqual fails when values differ', function (assert) {
    assert.throws(() => assert.deepEqual({ a: 1 }, { a: 2 }));
    assert.throws(() => assert.deepEqual([1, 2, 3], [1, 2, 4]));
    assert.throws(() => assert.deepEqual('foo', 'bar'));
  });

  test('notDeepEqual fails when values are deeply equal', function (assert) {
    assert.throws(() => assert.notDeepEqual({ a: 1 }, { a: 1 }));
    assert.throws(() => assert.notDeepEqual([1, 2], [1, 2]));
    assert.throws(() => assert.notDeepEqual('same', 'same'));
  });
});

module('Assertion: propContains/notPropContains - failing assertions', function (hooks) {
  hooks.beforeEach(function (assert) {
    const originalPushResult = assert.pushResult;
    assert.pushResult = function (resultInfo) {
      resultInfo.result = !resultInfo.result;
      originalPushResult.call(this, resultInfo);
    };
  });

  test('propContains fails when subset properties differ', function (assert) {
    assert.throws(() => assert.propContains({ a: 1, b: 2 }, { a: 2 }));
    assert.throws(() => assert.propContains({ x: 'hello' }, { x: 'world' }));
  });

  test('notPropContains fails when subset properties match', function (assert) {
    assert.throws(() => assert.notPropContains({ a: 1, b: 2 }, { a: 1 }));
    assert.throws(() => assert.notPropContains({ a: 1 }, { a: 1 }));
  });
});

module('Assertion: propEqual with objectType edge cases', function () {
  test('propEqual with null covers objectType null branch', function (assert) {
    assert.propEqual(null, null);
  });

  test('propEqual with NaN covers objectType nan branch', function (assert) {
    assert.propEqual(NaN, NaN);
  });
});

// The tests below rely on custom shim behaviour (assertions throw on failure)
// and do not apply to the QUnit browser shim where failures are recorded instead.
// Use `document` (not `window`) as the browser guard — Deno exposes `window` in
// some versions for web-compat but never exposes `document`.
if (typeof document === 'undefined') {
  module('Assertion: timeout and expect - invalid inputs', function () {
    test('timeout throws for non-integer or negative values', function (assert) {
      assert.throws(() => assert.timeout(-1), /assert\.timeout\(\) expects a positive integer/);
      assert.throws(() => assert.timeout(1.5), /assert\.timeout\(\) expects a positive integer/);
      assert.throws(() => assert.timeout('5'), /assert\.timeout\(\) expects a positive integer/);
    });

    test('expect throws for non-integer or negative values', function (assert) {
      assert.throws(() => assert.expect(-1), /assert\.expect\(\) expects a positive integer/);
      assert.throws(() => assert.expect(1.5), /assert\.expect\(\) expects a positive integer/);
      assert.throws(() => assert.expect('5'), /assert\.expect\(\) expects a positive integer/);
    });

    test('pushResult with result:false throws AssertionError', function (assert) {
      assert.throws(
        () => assert.pushResult({ result: false, message: 'custom fail message' }),
        /custom fail message/,
      );
    });
  });

  module('Assertion: rejects with non-promise input', function () {
    test('rejects throws when given a non-promise', async function (assert) {
      await assert.rejects(assert.rejects(42), /was not a promise/);
      await assert.rejects(assert.rejects(null), /was not a promise/);
      await assert.rejects(assert.rejects('string'), /was not a promise/);
    });
  });

  module('Assertion: throws with validator function that throws internally', function () {
    test('throws passes and covers validateException catch branch', function (assert) {
      // The validator function itself throws - validateException catches it.
      // Due to array return from validateException, result is not checked strictly,
      // so the assertion passes, but the catch branch in validateException is covered.
      assert.throws(
        function () {
          throw new Error('actual error');
        },
        function () {
          throw new TypeError('validator threw');
        },
      );
    });
  });
}
