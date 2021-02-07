#! /usr/bin/env node
import fs from 'fs/promises';
import chalk from 'chalk';
import displayHelpOutput from './lib/commands/help.js';
import run from './lib/commands/run.js';
import parseCliInputs from './lib/parse-cli-inputs.js';

process.title = 'qunitx';

(async () => {
  if (!process.argv[2]) {
    return await displayHelpOutput();
  } else if (['help', 'h', 'p', 'print'].includes(process.argv[2])) {
    return await displayHelpOutput();
  }

  let config = await parseCliInputs();

  return await run(config);
})();

