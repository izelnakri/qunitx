import { module, test } from 'qunitx';

module('{{moduleName}}', function(hooks) {
  test('assert true works', function (assert) {
    assert.expect(3);
    assert.ok(true);
    assert.equal(true, true);
    assert.deepEqual({}, {});
  });

  test('async test finishes', async function (assert) {
    assert.expect(1);

    let wait = () => new Promise((reject, resolve) => {
      window.setTimeout(() => resolve(true), 50);
    });
    let result = await wait();

    assert.ok(true);
    assert.equal(true, result);

    result.then((result) => assert.equal(true, result));
  });
});
