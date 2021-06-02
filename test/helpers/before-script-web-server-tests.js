import { module, test } from '../../index.js';
import axios from 'axios';

module('{{moduleName}} Before script web server tests', function(hooks) {
  test('assert true works', async function (assert) {
    let res = await axios({ method: 'get', url: 'http://localhost:4000/films' });

    assert.deepEqual(res.data, { film: 'responsed correctly' });
  });

  // test('async test finishes', async function (assert) {

  // });
});
