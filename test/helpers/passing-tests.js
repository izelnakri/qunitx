import { module, test } from 'qunitx';

module('{{moduleName}} Passing Tests', function(hooks) {
  test('assert true works', function (assert) {
    assert.expect(3);
    assert.ok(true);
    console.log('calling assert true test case');
    assert.equal(true, true);
    assert.equal(null, null);
  });

  test('async test finishes', async function (assert) {
    assert.expect(3);

    const wait = new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('resolving async test');
        console.log({
          moduleName: 'called resolved async test with object',
          placeholder: 1000,
          anotherObject: {
            firstName: 'Izel',
            createdAt: new Date('2021-03-06')
          }
        });
        resolve(true)
      }, 50);
    });
    const result = await wait;

    assert.ok(true);
    assert.equal(true, result);
    assert.equal(null, null);

    result;
  });

  test('deepEqual true works', function (assert) {
    const me = { firstName: 'Izel', lastName: 'Nakri' };

    console.log('calling deepEqual test case');
    assert.deepEqual(me, { firstName: 'Izel', lastName: 'Nakri' });
  });
});
