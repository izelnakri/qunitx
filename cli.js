#!/usr/bin/env -S TS_NODE_COMPILER_OPTIONS='{"module":"ES2020"}' node --loader ts-node/esm/transpile-only
import process from 'node:process';
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
