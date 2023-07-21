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

// module('Assertion: Equality - failing assertions', function () {
//   test('assert.equal', function (assert) {
//     assert.equal(1, 2);
//     assert.equal('foo', 'bar');
//     assert.equal({}, {});
//     assert.equal([], []);
//   });

//   test('assert.notEqual', function (assert) {
//     assert.notEqual(1, 1);
//     assert.notEqual('foo', 'foo');
//     assert.notEqual('foo', ['foo']);
//     assert.notEqual('foo', { toString: function () { return 'foo'; } });
//     assert.notEqual(0, [0]);
//   });
// });
