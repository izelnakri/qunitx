import fs from 'fs/promises';
import defaultProjectConfigValues from '../boilerplates/default-project-config-values.js';
import findProjectRoot from '../utils/find-project-root.js';
import parseCliFlags from '../utils/parse-cli-flags.js';

export default async function setupConfig() {
  let [config, { projectRoot, packageJSONConfig }] = await Promise.all([
    parseCliFlags(),
    readConfigFromPackageJSON()
  ]);

  return normalizeHTMLPaths(Object.assign(
    { htmlPaths: [], lastFailedTestFiles: null, lastRanTestFiles: null },
    defaultProjectConfigValues,
    packageJSONConfig.qunitx,
    config,
    { projectRoot }
  ));
}

async function readConfigFromPackageJSON() {
  const projectRoot = await findProjectRoot();
  const packageJSON = await fs.readFile(`${projectRoot}/package.json`);
  const packageJSONConfig = JSON.parse(packageJSON.toString());

  return { projectRoot, packageJSONConfig };
}

function normalizeHTMLPaths(config) {
  config.htmlPaths = Array.from(new Set(config.htmlPaths
    .map((htmlPath) => `${config.projectRoot}/${htmlPath}`)));

  return config;
}
