import { module, test } from 'qunitx';

module('Assertion: Expect | Passing Assertions', function (hooks) {
  test('expect(4) makes the test passes when there are 4 cases', function (assert) {
    assert.expect(4);

    assert.ok(true);
    assert.ok(true);
    assert.ok(true);
    assert.ok(true);
  });
});

module('Assertion: Expect | expect() without an argument', function () {
  test('returns the number of assertions set so far', function (assert) {
    assert.expect(1);
    assert.strictEqual(assert.expect(), 1);
  });
});
