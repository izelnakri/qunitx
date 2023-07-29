import { module, test } from 'qunitx';

module('Assertion: Equality - passing assertions', function () {
  test('assert.equal', function (assert) {
    assert.equal(1, 1);
    assert.equal('foo', 'foo');
    assert.equal('foo', ['foo']);
    assert.equal('foo', { toString: function () { return 'foo'; } });
    assert.equal(0, [0]);
  });

  test('assert.notEqual', function (assert) {
    assert.notEqual(1, 2);
    assert.notEqual('foo', 'bar');
    assert.notEqual({}, {});
    assert.notEqual([], []);
  });
});

module('Assertion: Equality - failing assertions', function (hooks) {
  hooks.beforeEach(function (assert) {
    let originalPushResult = assert.pushResult;
    assert.pushResult = function (resultInfo) {
      // Inverts the result so we can test failing assertions
      resultInfo.result = !resultInfo.result;
      originalPushResult.call(this, resultInfo);
    };
  });

  test('assert.equal', function (assert) {
    let { throws } = assert;

    debugger;
    throws(() => assert.equal(1, 2));
    throws(() => assert.equal('foo', 'bar'));
    throws(() => assert.equal({}, {}));
    throws(() => assert.equal([], []));
  });

  test('assert.notEqual', function (assert) {
    let { throws } = assert;

    throws(() => assert.notEqual(1, 1));
    throws(() => assert.notEqual('foo', 'foo'));
    throws(() => assert.notEqual('foo', ['foo']));
    throws(() => assert.notEqual('foo', { toString: function () { return 'foo'; } }));
    throws(() => assert.notEqual(0, [0]));
  });
});
