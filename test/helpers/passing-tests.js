import { module, test } from '../../index.js';

module('{{moduleName}}', function(hooks) {
  test('assert true works', function (assert) {
    assert.expect(3);
    assert.ok(true);
    assert.equal(true, true);
    assert.equal(null, null);
  });

  test('async test finishes', async function (assert) {
    assert.expect(3);

    const wait = new Promise((resolve, reject) => {
      window.setTimeout(() => resolve(true), 50);
    });
    const result = await wait;

    assert.ok(true);
    assert.equal(true, result);
    assert.equal(null, null);

    result;
  });

  test('deepEqual true works', function (assert) {
    const me = { firstName: 'Izel', lastName: 'Nakri' };

    assert.deepEqual(me, { firstName: 'Izel', lastName: 'Nakri' });
  });
});
