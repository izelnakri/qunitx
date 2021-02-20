import fs from 'fs/promises';
import chalk from 'chalk';

export default async function(config) {
  const { browser, fileOrFolderInputs } = config;

  if (!browser) {
    const QUnit = (await import('../setup-node-js-environment.js')).default;

    fileOrFolderInputs.forEach(async (fileOrFolder, index) => {
      // TODO: handle/format globs

      try {
        const entry = await fs.stat(fileOrFolder);

        if (entry.isDirectory()) {
          console.log(entry, ' is directory');
        } else if (entry.isFile()) { // handle what to do when its .ts
          await import(`${process.cwd()}/${fileOrFolder}`);
        }
      } catch (error) {
        console.log(error);

        return process.exit(1);
      }

      if (index === (fileOrFolderInputs.length - 1)) {
        if (!browser) {
          console.log('TAP version 13');
          QUnit.start();
        }
      }
    });
  }
}
