import fs from 'fs/promises';
import defaultProjectConfigValues from '../boilerplates/default-project-config-values.js';
import findProjectRoot from '../utils/find-project-root.js';
import setupFSTree from './fs-tree.js';
import setupTestFilePaths from './test-file-paths.js';
import parseCliFlags from '../utils/parse-cli-flags.js';

export default async function setupConfig() {
  let [cliConfigFlags, { projectRoot, packageJSONConfig }] = await Promise.all([
    parseCliFlags(), // NOTE: creates userFileOrFolderInputs[]
    readConfigFromPackageJSON()
  ]);
  let config = {
    projectRoot,
    htmlPaths: [],
    lastFailedTestFiles: null,
    lastRanTestFiles: null,
    ...defaultProjectConfigValues,
    ...packageJSONConfig.qunitx,
    ...cliConfigFlags,
  };
  config.htmlPaths = normalizeHTMLPaths(config.projectRoot, config.htmlPaths);
  config.testFileLookupPaths = setupTestFilePaths(config.projectRoot, config.userFileOrFolderInputs);
  config.fsTree = await setupFSTree(config.testFileLookupPaths, config);

  return config;
}

async function readConfigFromPackageJSON() {
  let projectRoot = await findProjectRoot();
  let packageJSON = await fs.readFile(`${projectRoot}/package.json`);
  let packageJSONConfig = JSON.parse(packageJSON.toString());

  return { projectRoot, packageJSONConfig };
}

function normalizeHTMLPaths(projectRoot, htmlPaths) {
  return Array.from(new Set(htmlPaths.map((htmlPath) => `${projectRoot}/${htmlPath}`)));
}

