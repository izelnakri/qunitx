// @ts-nocheck
import { module, test } from 'qunitx';

module('assert.step', function () {
  test('pushes a failing assertion if no message is given', function (assert) {
    var original = assert.pushResult;
    var pushed = null;
    assert.pushResult = function (resultInfo) {
      pushed = resultInfo;
    };

    assert.step();

    assert.pushResult = original;
    assert.false(pushed.result);
    assert.equal(pushed.message, 'You must provide a message to assert.step');

    assert.verifySteps([undefined]);
  });

  test('pushes a failing assertion if empty message is given', function (assert) {
    var original = assert.pushResult;
    var pushed = null;
    assert.pushResult = function (resultInfo) {
      pushed = resultInfo;
    };

    assert.step('');

    assert.pushResult = original;
    assert.false(pushed.result);
    assert.equal(pushed.message, 'You must provide a message to assert.step');

    assert.verifySteps(['']);
  });

  test('pushes a failing assertion if a non string message is given', function (assert) {
    var original = assert.pushResult;
    var pushed = [];
    assert.pushResult = function (resultInfo) {
      pushed.push(resultInfo);
    };

    assert.step(1);
    assert.step(null);
    assert.step(false);

    assert.pushResult = original;
    assert.deepEqual(pushed, [
      { result: false, message: 'You must provide a string value to assert.step' },
      { result: false, message: 'You must provide a string value to assert.step' },
      { result: false, message: 'You must provide a string value to assert.step' },
    ]);
    assert.verifySteps([1, null, false]);
  });

  test('pushes a passing assertion if a message is given', function (assert) {
    assert.step('One step');
    assert.step('Two step');

    assert.verifySteps(['One step', 'Two step']);
  });

  test('step() and verifySteps() count as assertions', function (assert) {
    assert.expect(3);

    assert.step('One');
    assert.step('Two');

    assert.verifySteps(['One', 'Two'], 'Three');
  });

  // NOTE: running test() should make the module change(?)
  module('assert.verifySteps', function () {
    // assert.throws only works where assertions throw on failure (Node/Deno shim).
    // Browser QUnit records failures instead of throwing, so skip there.
    if (typeof (globalThis as Record<string, unknown>)['document'] === 'undefined') {
      test('verifySteps fails when steps do not match', function (assert) {
        assert.step('actual');
        // This should fail because steps=['actual'] but we expect ['expected']
        assert.throws(
          () => assert.verifySteps(['expected']),
          'verifySteps throws when steps do not match',
        );
        // verifySteps threw before clearing steps; verify what remains to clean up
        assert.verifySteps(['actual']);
      });
    }

    test('verifies the order and value of steps', function (assert) {
      assert.step('One step');
      assert.step('Two step');
      assert.step('Red step');
      assert.step('Blue step');

      assert.verifySteps(['One step', 'Two step', 'Red step', 'Blue step']);

      assert.step('One step');
      assert.step('Two step');
      assert.step('Red step');
      assert.step('Blue step');

      assert.verifySteps(['One step', 'Two step', 'Red step', 'Blue step']);
    });

    test('verifies the order and value of failed steps', function (assert) {
      assert.step('One step');

      var original = assert.pushResult;
      assert.pushResult = function noop() {};
      assert.step();
      assert.step('');
      assert.pushResult = original;

      assert.step('Two step');

      assert.verifySteps(['One step', undefined, '', 'Two step']);
    });

    test('resets the step list after verification', function (assert) {
      assert.step('one');
      assert.verifySteps(['one']);

      assert.step('two');
      assert.verifySteps(['two']);
    });
  });
});
