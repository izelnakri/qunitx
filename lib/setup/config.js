import fs from 'fs/promises';
import defaultProjectConfigValues from '../boilerplates/default-project-config-values.js';
import findProjectRoot from '../utils/find-project-root.js';
import setupTestFilePaths from './test-file-paths.js';
import parseCliFlags from '../utils/parse-cli-flags.js';

export default async function setupConfig() {
  let [cliConfigFlags, { projectRoot, packageJSONConfig }] = await Promise.all([
    parseCliFlags(),
    readConfigFromPackageJSON()
  ]);
  let config = {
    projectRoot,
    htmlPaths: [],
    lastFailedTestFiles: null,
    lastRanTestFiles: null,
    ...defaultProjectConfigValues,
    ...packageJSONConfig.qunitx,
    ...cliConfigFlags, // NOTE: creates userFileOrFolderInputs[]
  };
  config.htmlPaths = normalizeHTMLPaths(config.projectRoot, config.htmlPaths);
  config.testFilePaths = setupTestFilePaths(config.projectRoot, config.userFileOrFolderInputs);
  // config.fsTree = await buildFSTree(config.userFileOrFolderInputs) // this should be flat -> [absolutePath]: [content]

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

    }

    }
}
