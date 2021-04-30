#! /usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import defaultProjectConfigValues from './lib/boilerplates/default-project-config-values.js';
import displayHelpOutput from './lib/commands/help.js';
import initializeProject from './lib/commands/init.js';
import generateTestFiles from './lib/commands/generate.js';
import run from './lib/commands/run.js';
import findProjectRoot from './lib/utils/find-project-root.js';
import parseCliFlags from './lib/utils/parse-cli-flags.js';
import resolvePortNumberFor from './lib/utils/resolve-port-number-for.js';

process.title = 'qunitx';

(async () => {
  if (!process.argv[2]) {
    return await displayHelpOutput();
  } else if (['help', 'h', 'p', 'print'].includes(process.argv[2])) {
    return await displayHelpOutput();
  } else if (['new', 'n', 'g', 'generate'].includes(process.argv[2])) {
    return await generateTestFiles();
  } else if (['init'].includes(process.argv[2])) {
    return await initializeProject();
  }

  let [config, { projectRoot, packageJSONConfig }] = await Promise.all([
    parseCliFlags(),
    readConfigFromPackageJSON()
  ]);
  let targetConfig = normalizeHTMLPaths(Object.assign(
    { htmlPaths: [], lastFailedTestFiles: null, lastRanTestFiles: null },
    defaultProjectConfigValues,
    packageJSONConfig.qunitx,
    config,
    { projectRoot }
  ));

  return await run(targetConfig);
})();

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
