import { module, test } from '../../index.js';

module('{{moduleName}} Before script web server tests', function(hooks) {
  test('assert true works', async function (assert) {
<<<<<<< HEAD
    let res = await fetch('http://localhost:4000/films');

    assert.deepEqual(await res.json(), { film: 'responsed correctly' });
=======
    let json;
    try {
      let port = QUnit.config.port || location.port;
      let res = await fetch(`http://127.0.0.1:${port}/films`);
      json = await res.json();
    } catch (err) {
      console.log('FETCH ERR', err);
      console.log(err.cause);
    }

    assert.deepEqual(json, { film: 'responsed correctly' });
>>>>>>> ed0281f (Lock Node to v19 with TEST RUNNER & PKG REMOVALS)
  });

  // test('async test finishes', async function (assert) {

  // });
});

function wait(duration) {
  return new Promise((resolve) => setTimeout(() => { resolve() }, duration));
}
