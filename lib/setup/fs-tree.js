import fs from 'node:fs/promises';
import picomatch from 'picomatch';
import recursiveLookup from 'recursive-lookup';

export default async function buildFSTree(fileAbsolutePaths, config = {}) {
  let targetExtensions = ['js', 'ts'];
  let fsTree = {};

  await Promise.all(fileAbsolutePaths.map(async (fileAbsolutePath) => {
    let glob = picomatch.scan(fileAbsolutePath);

    // TODO: maybe allow absolute path references

    try {
      if (glob.isGlob) {
        let fileNames = await recursiveLookup(glob.base, (path) => {
          return targetExtensions.some((extension) => path.endsWith(extension));
        });

        fileNames.forEach((fileName) => {
          if (picomatch.isMatch(fileName, fileAbsolutePath, { bash: true })) {
            fsTree[fileName] = null;
          }
        });
      } else {
        let entry = await fs.stat(fileAbsolutePath);

        if (entry.isFile()) {
          fsTree[fileAbsolutePath] = null;
        } else if (entry.isDirectory()) {
          let fileNames = await recursiveLookup(glob.base, (path) => {
            return targetExtensions.some((extension) => path.endsWith(extension));
          });

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
