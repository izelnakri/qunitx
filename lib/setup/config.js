import fs from 'node:fs/promises';
import defaultProjectConfigValues from '../boilerplates/default-project-config-values.js';
import findProjectRoot from '../utils/find-project-root.js';
import setupFSTree from './fs-tree.js';
import setupTestFilePaths from './test-file-paths.js';
import parseCliFlags from '../utils/parse-cli-flags.js';

export default async function setupConfig() {
  let projectRoot = await findProjectRoot();
  let [projectPackageJSON, cliConfigFlags] = await Promise.all([
    readConfigFromPackageJSON(projectRoot),
    parseCliFlags(projectRoot)
  ]);
  let inputs = cliConfigFlags.inputs.concat(readInputsFromPackageJSON(projectPackageJSON));
  let config = {
    projectRoot,
    htmlPaths: [],
    lastFailedTestFiles: null,
    lastRanTestFiles: null,
    ...defaultProjectConfigValues,
    ...projectPackageJSON.qunitx,
    ...cliConfigFlags,
    inputs
  };
  config.htmlPaths = normalizeHTMLPaths(config.projectRoot, config.htmlPaths);
  config.testFileLookupPaths = setupTestFilePaths(config.projectRoot, config.inputs);
  config.fsTree = await setupFSTree(config.testFileLookupPaths, config);

  return config;
}

async function readConfigFromPackageJSON(projectRoot) {
  let packageJSON = await fs.readFile(`${projectRoot}/package.json`);

  return JSON.parse(packageJSON.toString());
}

function normalizeHTMLPaths(projectRoot, htmlPaths) {
  return Array.from(new Set(htmlPaths.map((htmlPath) => `${projectRoot}/${htmlPath}`)));
}

function readInputsFromPackageJSON(packageJSON) {
  let qunitx = packageJSON.qunitx;

  return qunitx && qunitx.inputs ? qunitx.inputs : [];
}
