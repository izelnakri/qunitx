// @ts-nocheck
import { module, test } from 'qunitx';

module('Assertion: closeTo - passing assertions', function () {
  // The examples from QUnit's assert.closeTo() documentation.
  test('passes within the delta, inclusive', function (assert) {
    assert.closeTo(0.1 + 0.2, 0.3, 0.001);
    assert.closeTo(Math.PI, 3.141, 0.001);
    assert.closeTo(2014, 2012, 2);
    assert.closeTo(2010, 2012, 2);
  });

  test('requires a delta', function (assert) {
    assert.throws(() => assert.closeTo(1, 1), new TypeError('closeTo() requires a delta argument'));
  });
});

module('Assertion: closeTo - failing assertions', function (hooks) {
  hooks.beforeEach(function (assert) {
    const originalPushResult = assert.pushResult;
    assert.pushResult = function (resultInfo) {
      resultInfo.result = !resultInfo.result;
      originalPushResult.call(this, resultInfo);
    };
  });

  test('fails outside the delta', function (assert) {
    assert.throws(() => assert.closeTo(2015, 2012, 2));
    assert.throws(() => assert.closeTo(0.31, 0.3, 0.001));
    assert.throws(() => assert.closeTo(NaN, 0, 1));
  });
});
