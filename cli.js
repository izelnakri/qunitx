#! /usr/bin/env node
import fs from 'fs/promises';
import chalk from 'chalk';
import displayHelpOutput from './lib/commands/help.js';

process.title = 'qunitx';

(async () => {
  if (!process.argv[2]) {
    return await displayHelpOutput();
  } else if (['help', 'h', 'p', 'print'].includes(process.argv[2])) {
    return await displayHelpOutput();
  }

  const fileOrFolder = process.argv[2]; // then turn this to array of remaining args
  try {
    const entry = await fs.stat(fileOrFolder);

    if (entry.isDirectory()) {
      console.log('entry', entry, ' is directory');
    } else if (entry.isFile()) {
      console.log('entry', entry, ' is file');
    }
  } catch (error) {
    console.log(error);

    return process.exit(1);
  }
  // if file execute file
})();

