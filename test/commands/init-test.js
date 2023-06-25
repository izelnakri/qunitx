import { module, test } from 'qunitx';
import assert from 'node:assert';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';

const shell = promisify(exec);
const cli = async function(arg = '') {
  if (process.argv[0].includes('deno')) {
    return await shell(`deno run --allow-read ${CWD}/deno/cli.js ${arg}`);
  }

  return await shell(`deno run --allow-read ${CWD}/cli.js ${arg}`);
}

module('Commands | init tests', () => {
  test('$ qunitx init -> creates the test.html and correctly', async () => {
    // assert missing
    const { stdout } = await cli('init');
    // assert added
  });

  // it('$ qunitx init warns existing files and assigns attributes to package.json', async function() {

  // });

  // it('$ qunitx init -> recreates missing files from package.json if it exists', async function() {

  // });
});

async function stripQUnitXFromPackageJSON() {

}

// it('$ qunitx unknown -> raises error', async function() {
//   t.plan(2);

//   try {
//     await shell(`node ${process.cwd()}/cli.js dasd`);
//   } catch ({ stdout }) {
//     assert.ok(stdout.includes('qunitx unknown command. Available options are:'));
//     assert.ok(stdout.includes(printedHelpOutput));
//   }
// });
