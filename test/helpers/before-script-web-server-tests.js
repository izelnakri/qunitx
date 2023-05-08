import { module, test } from '../../index.js';

module('{{moduleName}} Before script web server tests', function(hooks) {
  test('assert true works', async function (assert) {
    let res = await fetch('http://localhost:4000/films');

    assert.deepEqual(await res.json(), { film: 'responsed correctly' });
  });

  // test('async test finishes', async function (assert) {

  // });
});
