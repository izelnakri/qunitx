import fs from 'fs/promises';
import findProjectRoot from '../utils/find-project-root.js';
import pathExists from '../utils/path-exists.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function() {
  const fileName = process.argv[3];
  const projectRoot = await findProjectRoot();
  const testsDirectory = `${projectRoot}/tests`; // TODO: in future make this customizable from project package.json

  if (await pathExists(`${projectRoot}/tests/${fileName}.js`)) {
    return console.log(`${projectRoot}/tests/${fileName}.js already exists!`);
  }

  const testJSContent = await fs.readFile(`${__dirname}/../boilerplates/test.js`);

  // TODO: in future normalize the fileName, determine if it should be .ts or .js

  await fs.mkdir(`${projectRoot}/tests`, { recursive: true });
  await fs.writeFile(
    `${projectRoot}/tests/${fileName}.js`,
    testJSContent.toString().replace('{{moduleName}}', fileName)
  );

  console.log(`${projectRoot}/tests/${fileName}.js written`);
}
