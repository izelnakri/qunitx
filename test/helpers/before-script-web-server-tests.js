import { module, test } from '../../index.js';

module('{{moduleName}} Before script web server tests', function(hooks) {
  test('assert true works', async function (assert) {
    let json;
    try {
      let port = window.QUnit.config.port || location.port;

      await wait(250);

      let res = await fetch(`http://127.0.0.1:${port}/films`);
      json = await res.json();
    } catch (err) {
      console.log('FETCH ERR', err);
      console.log(err.cause);
    }

    assert.deepEqual(json, { film: 'responsed correctly' });
  });

  // test('async test finishes', async function (assert) {

  // });
});

function wait(duration) {
  return new Promise((resolve) => setTimeout(() => { resolve() }, duration));
}
