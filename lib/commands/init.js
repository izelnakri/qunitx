import fs from 'fs/promises';
import path from 'path';
import findProjectRoot from '../utils/find-project-root.js';
import pathExists from '../utils/path-exists.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import defaultProjectConfigValues from '../boilerplates/default-project-config-values.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function() {
  let projectRoot = await findProjectRoot();
  let oldPackageJSON = JSON.parse(await fs.readFile(`${projectRoot}/package.json`));
  let htmlPaths = process.argv.slice(2).reduce((result, arg) => {
    if (arg.endsWith('.html')) {
      result.push(arg);
    }

    return result;
  }, oldPackageJSON.qunitx ? oldPackageJSON.qunitx.htmlPaths : []);
  let newQunitxConfig = Object.assign(
    defaultProjectConfigValues,
    htmlPaths.length > 0 ? { htmlPaths } : { htmlPaths: ['test/tests.html'] },
    oldPackageJSON.qunitx
  );

  await Promise.all([
    writeTestsHTML(projectRoot, newQunitxConfig, oldPackageJSON),
    rewritePackageJSON(projectRoot, newQunitxConfig, oldPackageJSON)
  ]);
}

async function writeTestsHTML(projectRoot, newQunitxConfig, oldPackageJSON) {
  let testHTMLTemplateBuffer = await fs.readFile(`${__dirname}/../boilerplates/setup/tests.hbs`);
  let testHTMLTemplate = testHTMLTemplateBuffer
    .toString()
    .replace('{{applicationName}}', oldPackageJSON.name)
    .replace('{{content}}', '<script src="./dist/tests.js"></script>'); // TODO: generate this from output/test diff

  return await Promise.all(newQunitxConfig.htmlPaths.map(async (htmlPath) => {
    let targetPath = `${projectRoot}/${htmlPath}`;
    if (await pathExists(targetPath)) {
      return console.log(`${htmlPath} already exists`);
    } else {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, testHTMLTemplate);

      console.log(`${targetPath} written`);
    }
  }));
}

async function rewritePackageJSON(projectRoot, newQunitxConfig, oldPackageJSON) {
  let newPackageJSON = Object.assign(oldPackageJSON, { qunitx: newQunitxConfig });

  await fs.writeFile(`${projectRoot}/package.json`, JSON.stringify(newPackageJSON, null, 2));
}
