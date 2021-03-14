#! /usr/bin/env node
import fs from 'fs/promises';
import chalk from 'chalk';
import displayHelpOutput from './lib/commands/help.js';
import initializeProject from './lib/commands/init.js';
import generateTestFiles from './lib/commands/generate.js';
import run from './lib/commands/run.js';
import parseCliFlags from './lib/utils/parse-cli-flags.js';
import resolvePortNumberFor from './lib/utils/resolve-port-number-for.js';

process.title = 'qunitx';

(async () => {
  if (!process.argv[2]) {
    return await displayHelpOutput();
  } else if (['help', 'h', 'p', 'print'].includes(process.argv[2])) {
    return await displayHelpOutput();
  } else if (['init', 'new'].includes(process.argv[2])) {
    return await initializeProject();
  } else if (['g', 'generate'].includes(process.argv[2])) {
    return await generateTestFiles();
  }

  let config = await parseCliFlags();
  let [httpPort, wsPort] = await Promise.all([
    resolvePortNumberFor(1234),
    resolvePortNumberFor(4000)
  ]);

  Object.assign(config, {
    httpPort,
    timeout: config.timeout || 10000,
    wsPort
  });

  return await run(config);
})();
