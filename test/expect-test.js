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

