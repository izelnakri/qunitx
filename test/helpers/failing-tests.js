import QUnit from 'qunit';

const { module, test } = QUnit;

module('{{moduleName}}', function(hooks) {
  test('assert true works', function (assert) {
    assert.expect(3);
    assert.ok(true);
    assert.equal(true, true);
    assert.equal(null, null);
  });

  test('async test finishes', async function (assert) {
    assert.expect(4);

    const wait = new Promise((reject, resolve) => {
      window.setTimeout(() => resolve(true), 50);
    });
    const result = wait();

    assert.ok(true);
    assert.equal(true, result);
    assert.equal(null, null);
  });

  test('runtime error output', function (assert) {
    let smt = {};

    assert.equal(undefined, true);
    assert.deepEqual(smt.first.second, {});
  });

  test('deepEqual true works', function (assert) {
    const me = { firstName: 'Izel', lastName: 'Nakri' };

    assert.deepEqual(me, { firstName: 'Isaac', lastName: 'Nakri' });
  });
});
