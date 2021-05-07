#! /usr/bin/env node
import displayHelpOutput from './lib/commands/help.js';
import initializeProject from './lib/commands/init.js';
import generateTestFiles from './lib/commands/generate.js';
import run from './lib/commands/run.js';
import setupConfig from './lib/setup/config.js';

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

  let config = await setupConfig();

  return await run(config);
})();
