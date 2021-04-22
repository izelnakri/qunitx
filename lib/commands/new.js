import fs from 'fs/promises';
import kleur from 'kleur';
import defaultProjectConfigValues from '../boilerplates/default-project-config-values.js';

export default async function() {
  let targetFilePath = process.argv[2]; // if 3 params get from second the path or make dasherized 'test/test-module-name'
  let oldPackageJSON = JSON.parse(await fs.readFile(`${projectRoot}/package.json`));
  let htmlPaths = oldPackageJSON.qunitx && oldPackageJSON.qunitx.htmlPaths ? oldPackageJSON.qunitx.htmlPaths : []);
  let newQunitxConfig = Object.assign(
    defaultProjectConfigValues,
    htmlPaths.length > 0 ? { htmlPaths } : { htmlPaths: ['test/tests.html'] },
    oldPackageJSON.qunitx
  );
  let moduleName = process.argv[3] || process.argv[2]; // TODO: classify the module

  await fs.writeFile(
    targetFilePath,
`
import { module, test } from 'qunitx';

module('{{moduleName}}', function() {
  test('asserts true', function(assert) {
    assert.equal(true, true);
  });
});`.trim().replace('{{moduleName}}', moduleName));

  console.log(kleur.magenta.bold(`${moduleName} qunitx test file created on:`),  kleur.yellow(`${targetFilePath}`));
}
