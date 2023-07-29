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

module('Assertion: Truthy - failing assertions', function (hooks) {
  hooks.beforeEach(function (assert) {
    let originalPushResult = assert.pushResult;
    assert.pushResult = function (resultInfo) {
      // Inverts the result so we can test failing assertions
      resultInfo.result = !resultInfo.result;
      originalPushResult.call(this, resultInfo);
    };
  });

  test('ok', function (assert) {
    assert.throws(() => assert.ok(false));
    assert.throws(() => assert.ok(0));
    assert.throws(() => assert.ok(''));
    assert.throws(() => assert.ok(null));
    assert.throws(() => assert.ok(undefined));
    assert.throws(() => assert.ok(NaN));
  });

  test('notOk', function (assert) {
    assert.throws(() => assert.notOk(true));
    assert.throws(() => assert.notOk(1));
    assert.throws(() => assert.notOk('1'));
    assert.throws(() => assert.notOk(Infinity));
    assert.throws(() => assert.notOk({}));
    assert.throws(() => assert.notOk([]));
  });
});
