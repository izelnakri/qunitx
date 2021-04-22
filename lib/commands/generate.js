import fs from 'fs/promises';
import kleur from 'kleur';
import findProjectRoot from '../utils/find-project-root.js';
import pathExists from '../utils/path-exists.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function() {
  let projectRoot = await findProjectRoot();
  let moduleName = process.argv[3]; // TODO: classify this maybe in future
  let path = `${projectRoot}/${process.argv[3]}.js`;
  let targetFilePath = path.endsWith('.ts') || path.endsWith('.js') ? path : `${path}.js`;

  if (await pathExists(targetFilePath)) {
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
