import fs from 'fs/promises';
import chalk from 'chalk';

export default async function(config) {
  const { browser, fileOrFolderInputs } = fileOrFolderInputs;

  if (!browser) {
    const QUnit = (await import('./lib/setup-node-js-environment.js')).default;
  }

  fileOrFolderInputs.forEach((fileOrFolder) => {
    // TODO: handle/format globs

    try {
      const entry = await fs.stat(fileOrFolder);

      if (entry.isDirectory()) {
        console.log(entry, ' is directory');
      } else if (entry.isFile()) { // what to do when its .ts
        const QUnit = (await import('./lib/setup-node-js-environment.js')).default;

        console.log(fileOrFolder, 'if file');
        await import(`${process.cwd()}/${fileOrFolder}`);

      }
    } catch (error) {
      console.log(error);

      return process.exit(1);
    }
  });

  if (!browser) {
    QUnit.start();
  }
}
