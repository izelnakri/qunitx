import fs from 'fs/promises';
import chalk from 'chalk';

export default async function() {
  const targetFilePath = process.argv[3] ? process.argv[2] : // if 3 params get from second the path or make dasherized 'test/test-module-name'
  const targetPath = `${process.cwd()}/test/${targetFilePath}`; // get from projectJSON
  const moduleName = ''; // if 3 params 3rd if 2 params 2nd.

  await fs.writeFile(
    targetPath,
`
import { module, test } from 'qunitx';

module('{{moduleName}}', function() {
  test('asserts true', function(assert) {
    assert.equal(true, true);
  });
});`.trim().replace('{{moduleName}}', moduleName));

  console.log(chalk.magenta.bold(`${moduleName} qunitx test file created on:`),  chalk.yellow(`${targetPath}`));
}
