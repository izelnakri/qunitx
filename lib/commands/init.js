import fs from 'fs/promises';
import findProjectRoot from '../utils/find-project-root.js';
import pathExists from '../utils/path-exists.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function() {
  const projectRoot = await findProjectRoot();
  const projectName = 'Application'; // TODO: get this from process.argv or package.json in future

  await writeTestsHTML(projectRoot, projectName);
  // TODO: add package.json qunitx reference in future
}

async function writeTestsHTML(projectRoot, projectName) {
  if (await pathExists(`${projectRoot}/tests.html`)) {
    return console.log('tests.html already exists');
  }

  const testHTMLTemplateBuffer = await fs.readFile(`${__dirname}/../boilerplates/setup/tests.hbs`);
  const testHTMLTemplate = testHTMLTemplateBuffer
    .toString()
    .replace('{{applicationName}}', projectName)
    .replace('{{content}}', '<script src="./dist/tests.js"></script>');

  await fs.writeFile(`${projectRoot}/tests.html`, testHTMLTemplate);

  console.log(`${projectRoot}/tests.html written`);
}
