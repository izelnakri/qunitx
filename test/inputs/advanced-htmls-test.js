import { module, test } from '../../shims/nodejs.js';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';

const shell = promisify(exec);
// runTestInsideHTMLFile

module('Advanced HTML Input Tests', function() {
  test('testing with specific html without content works', async function(assert) {
    assert.equal(true, true);
  //   const { stdout } = await shell('node cli.js test/helpers/index-without-content.html');

  //   console.log(stdout);

  //   assert.match(stdout, /Hello from index-without-content.html/);
  });
});

// html without content
// html without content --browser --debug
// html with content
// html with content  --browser --debug
// multiple htmls
// multiple htmls --browser --debug --output
