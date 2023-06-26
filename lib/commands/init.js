import fs from 'node:fs/promises';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import findProjectRoot from '../utils/find-project-root.js';
import pathExists from '../utils/path-exists.js';
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
  }, oldPackageJSON.qunitx && oldPackageJSON.qunitx.htmlPaths ? oldPackageJSON.qunitx.htmlPaths : []);
  let newQunitxConfig = Object.assign(
    defaultProjectConfigValues,
    htmlPaths.length > 0 ? { htmlPaths } : { htmlPaths: ['test/tests.html'] },
    oldPackageJSON.qunitx
  );

  await Promise.all([
    writeTestsHTML(projectRoot, newQunitxConfig, oldPackageJSON),
    rewritePackageJSON(projectRoot, newQunitxConfig, oldPackageJSON),
    writeTSConfigIfNeeded(projectRoot)
  ]);
}

async function writeTestsHTML(projectRoot, newQunitxConfig, oldPackageJSON) {
  let testHTMLTemplateBuffer = await fs.readFile(`${__dirname}/../boilerplates/setup/tests.hbs`);

  return await Promise.all(newQunitxConfig.htmlPaths.map(async (htmlPath) => {
    let targetPath = `${projectRoot}/${htmlPath}`;
    if (await pathExists(targetPath)) {
      return console.log(`${htmlPath} already exists`);
    } else {
      let targetDirectory = path.dirname(targetPath);
      let targetOutputPath = path.relative(targetDirectory, `${projectRoot}/${newQunitxConfig.output}/tests.js`);
      let testHTMLTemplate = testHTMLTemplateBuffer
        .toString()
        .replace('{{applicationName}}', oldPackageJSON.name);

      await fs.mkdir(targetDirectory, { recursive: true });
      await fs.writeFile(targetPath, testHTMLTemplate);

      console.log(`${targetPath} written`);
    }
  }));
}

async function rewritePackageJSON(projectRoot, newQunitxConfig, oldPackageJSON) {
  let newPackageJSON = Object.assign(oldPackageJSON, { qunitx: newQunitxConfig });

  await fs.writeFile(`${projectRoot}/package.json`, JSON.stringify(newPackageJSON, null, 2));
}

async function writeTSConfigIfNeeded(projectRoot) {
  let targetPath = `${projectRoot}/tsconfig.json`;
  if (!(await pathExists(targetPath))) {
    let tsConfigTemplateBuffer = await fs.readFile(`${__dirname}/../boilerplates/setup/tsconfig.json`);

    await fs.writeFile(targetPath, tsConfigTemplateBuffer);

    console.log(`${targetPath} written`);
  }
}
