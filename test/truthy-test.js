import { module, test } from 'qunitx';

module('Assertion: Truthy - passing assertions', function () {
  test('ok', function (assert) {
    assert.ok(true);
    assert.ok(1);
    assert.ok('1');
    assert.ok(Infinity);
    assert.ok({});
    assert.ok([]);

    assert.ok(true, 'with message');
  });

  test('notOk', function (assert) {
    assert.notOk(false);
    assert.notOk(0);
    assert.notOk('');
    assert.notOk(null);
    assert.notOk(undefined);
    assert.notOk(NaN);

    assert.notOk(false, 'with message');
  });

  test('true', function (assert) {
    function functionThatReturnsTrue () {
      return true;
    }
    assert.true(true);
    assert.true(functionThatReturnsTrue());
  });

  test('false', function (assert) {
    function functionThatReturnsFalse () {
      return false;
    }
    assert.false(false);
    assert.false(functionThatReturnsFalse());
  });
});

// module('Assertion: Truthy - failing assertions', function () {
//   test('ok', function (assert) {
//     assert.ok(false);
//     assert.ok(0);
//     assert.ok('');
//     assert.ok(null);
//     assert.ok(undefined);
//     assert.ok(NaN);
//   });

//   test('notOk', function (assert) {
//     assert.notOk(true);
//     assert.notOk(1);
//     assert.notOk('1');
//     assert.notOk(Infinity);
//     assert.notOk({});
//     assert.notOk([]);
//   });
// });
