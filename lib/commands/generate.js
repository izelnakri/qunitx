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
  let path = process.argv[3].endsWith('.js') || process.argv[3].endsWith('.ts')
    ? `${projectRoot}/${process.argv[3]}`
    : `${projectRoot}/${process.argv[3]}.js`;

  if (await pathExists(path)) {
    return console.log(`${path} already exists!`);
  }

  let testJSContent = await fs.readFile(`${__dirname}/../boilerplates/test.js`);
  let targetFolderPaths = path.split('/');

  targetFolderPaths.pop();

  await fs.mkdir(targetFolderPaths.join('/'), { recursive: true });
  await fs.writeFile(
    path,
    testJSContent.toString().replace('{{moduleName}}', moduleName)
  );

  console.log(kleur.green(`${path} written`));
}
