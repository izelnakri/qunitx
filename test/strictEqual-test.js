import { module, test } from 'qunitx';

module('Assertion: Strict Equality - passing assertions', function () {
  test('strictEqual', function (assert) {
    assert.strictEqual(1, 1);
    assert.strictEqual('foo', 'foo');
  });

  test('notStrictEqual', function (assert) {
    assert.notStrictEqual(1, 2);
    assert.notStrictEqual('foo', 'bar');
    assert.notStrictEqual('foo', ['foo']);
    assert.notStrictEqual('1', 1);
    assert.notStrictEqual('foo', { toString: function () { return 'foo'; } });
  });
});

module('Assertion: Strict Equality - failing assertions', function (hooks) {
  hooks.beforeEach(function (assert) {
    let originalPushResult = assert.pushResult;
    assert.pushResult = function (resultInfo) {
      // Inverts the result so we can test failing assertions
      resultInfo.result = !resultInfo.result;
      originalPushResult.call(this, resultInfo);
    };
  });

  test('strictEqual', function (assert) {
    assert.throws(() => assert.strictEqual(1, 2));
    assert.throws(() => assert.strictEqual('foo', 'bar'));
    assert.throws(() => assert.strictEqual('foo', ['foo']));
    assert.throws(() => assert.strictEqual('1', 1));
    assert.throws(() => assert.strictEqual('foo', { toString: function () { return 'foo'; } }));
  });

  test('notStrictEqual', function (assert) {
    assert.throws(() => assert.notStrictEqual(1, 1));
    assert.throws(() => assert.notStrictEqual('foo', 'foo'));
  });
});
