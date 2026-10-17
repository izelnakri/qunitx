// @ts-nocheck
import { module, test } from 'qunitx';

module('assert.step', function () {
  test('throws a TypeError for an invalid value', function (assert) {
    assert.throws(
      () => assert.step(),
      new TypeError('You must provide a value to assert.step'),
      'no value',
    );
    assert.throws(
      () => assert.step(''),
      new TypeError('You must provide a value to assert.step'),
      'empty value',
    );
    assert.throws(
      () => assert.step(1),
      new TypeError('You must provide a string value to assert.step'),
      'number value',
    );
    assert.throws(
      () => assert.step(null),
      new TypeError('You must provide a string value to assert.step'),
      'null value',
    );
    assert.throws(
      () => assert.step(false),
      new TypeError('You must provide a string value to assert.step'),
      'false value',
    );
  });

  test('pushes a passing assertion if a message is given', function (assert) {
    assert.step('One step');
    assert.step('Two step');

    assert.verifySteps(['One step', 'Two step']);
  });

  // QUnit 3 counts only verifySteps(), not each step: https://github.com/qunitjs/qunit/issues/1226
  test('step() does not count as an assertion', function (assert) {
    assert.expect(1);

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

    test('an invalid step is not recorded', function (assert) {
      assert.step('One step');
      assert.throws(() => assert.step(''), TypeError);
      assert.step('Two step');

      assert.verifySteps(['One step', 'Two step']);
    });

    test('empty verifySteps()', function (assert) {
      assert.verifySteps([]);
    });

    test('expect() and verifySteps() together', function (assert) {
      assert.expect(2);
      assert.step('a');
      assert.step('b');
      assert.verifySteps(['a', 'b']);
      assert.step('c');
      assert.verifySteps(['c']);
    });

    test('resets the step list after verification', function (assert) {
      assert.step('one');
      assert.verifySteps(['one']);

      assert.step('two');
      assert.verifySteps(['two']);
    });
  });
});
