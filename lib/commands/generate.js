import fs from 'fs/promises';
import kleur from 'kleur';
import findProjectRoot from '../utils/find-project-root.js';
import pathExists from '../utils/path-exists.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// TODO: implement 3rd argument case
export default async function() {
  let projectRoot = await findProjectRoot();
  let targetFilePath = `${projectRoot}/${process.argv[3]}.js`; // if 3 params get from second the path or make dasherized 'test/test-module-name'
  let moduleName = process.argv[4] || process.argv[3]; // TODO: classify the module, implement 3rd argument

  // TODO: in future normalize the fileName, determine if it should be .ts or .js
  if (await pathExists(targetFilePath)) { // TODO: normalize the .ts/.js
    return console.log(`${targetFilePath} already exists!`);
  }

  let testJSContent = await fs.readFile(`${__dirname}/../boilerplates/test.js`);
  let targetFolderPaths = targetFilePath.split('/');

  targetFolderPaths.pop();

  await fs.mkdir(targetFolderPaths.join('/'), { recursive: true });
  await fs.writeFile(
    targetFilePath,
    testJSContent.toString().replace('{{moduleName}}', moduleName)
  );

  console.log(kleur.green(`${targetFilePath} written`));
}
