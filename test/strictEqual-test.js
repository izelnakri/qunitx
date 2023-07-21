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

// module('Assertion: Strict Equality - failing assertions', function () {
//   test('strictEqual', function (assert) {
//     assert.strictEqual(1, 2);
//     assert.strictEqual('foo', 'bar');
//     assert.strictEqual('foo', ['foo']);
//     assert.strictEqual('1', 1);
//     assert.strictEqual('foo', { toString: function () { return 'foo'; } });
//   });

//   test('notStrictEqual', function (assert) {
//     assert.notStrictEqual(1, 1);
//     assert.notStrictEqual('foo', 'foo');
//   });
// });
