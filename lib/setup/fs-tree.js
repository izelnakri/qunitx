import kleur from 'kleur';
import fs from 'fs/promises';
import picomatch from 'picomatch';
import recursiveFileLookup from '../utils/recursive-file-lookup.js';

export default async function buildFSTree(fileAbsolutePaths, config = {}) {
  let targetExtensions = config.browser ? ['js', 'ts'] : ['js'];
  let fsTree = {};

  await Promise.all(fileAbsolutePaths.map(async (fileAbsolutePath) => {
    if (!config.browser && fileAbsolutePath.endsWith('.ts') && !config.browser) {
      console.error(kleur.red(`qunitx cannot run ${fileAbsolutePath} without --browser`));
      process.exit(1);
    }

    let glob = picomatch.scan(fileAbsolutePath);

    // TODO: maybe allow absolute path references

    try {
      if (glob.isGlob) {
        let files = await recursiveFileLookup(glob.base, targetExtensions);

        files.forEach((fileName) => {
          if (picomatch.isMatch(fileName, fileAbsolutePath, { bash: true })) {
            fsTree[fileName] = null;
          }
        });
      } else {
        let entry = await fs.stat(fileAbsolutePath);

        if (entry.isFile()) {
          fsTree[fileAbsolutePath] = null;
        } else if (entry.isDirectory()) {
          let fileNames = await recursiveFileLookup(fileAbsolutePath, targetExtensions);

          fileNames.forEach((fileName) => {
            fsTree[fileName] = null;
          });
        }
      }
    } catch (error) {
      console.error(error);

      return process.exit(1);
    }
  }));

  return fsTree;
}
