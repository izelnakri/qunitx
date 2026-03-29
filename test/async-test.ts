import { module, test } from 'qunitx';

module('assert.async', function () {
  test('async() returns a function', function (assert) {
    assert.expect(1);
    const done = assert.async();
    assert.strictEqual(typeof done, 'function', 'async() returns a callable done function');
    done();
  });

  test('basic usage - done() resolves before test finishes', function (assert) {
    assert.expect(1);
    const done = assert.async();
    setTimeout(function () {
      assert.ok(true, 'async callback ran');
      done();
    });
  });

  test('multiple async() calls - all must complete', function (assert) {
    assert.expect(2);
    const done1 = assert.async();
    const done2 = assert.async();
    setTimeout(function () {
      assert.ok(true, 'first async callback ran');
      done1();
    });
    setTimeout(function () {
      assert.ok(true, 'second async callback ran');
      done2();
    });
  });
});
