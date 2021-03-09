import fs from 'fs/promises';
import recursiveFileLookup from './recursive-file-lookup.js';

export default async function(fsInputs=[], initialFsTree={}, callback=async () => {}, config={}) {
  return fsInputs.reduce(async (fsTree, fsReference, index) => {
    if (!config.browser && fsReference.endsWith('.ts')) {
      let targetPath = `${process.cwd()}/${fsReference}`;

      console.error(chalk.red(`qunitx cannot run ${targetPath} without --browser`));
      process.exit(1);
    }

    // TODO: maybe format './', 'asd', '/asdasd' for fsReference
    // TODO: try checking for linenumbers refs

    try {
      const entry = await fs.stat(fsReference);

      if (entry.isFile()) { // handle what to do when its .ts
        let targetPath = `${process.cwd()}/${fsReference}`;

        if (!fsTree[targetPath]) {
          let treeEntry = {
            targetLine: null,
            originalContent: null,
            transpiledContent: null,
            executed: false
          }

          await callback(targetPath, treeEntry);

          return Object.assign(fsTree, { [`${targetPath}`]: treeEntry });
        }
      } else if (entry.isDirectory()) {
        let targetFiles = config.browser ? ['js', 'ts'] : ['js'];
        let fileNames = await recursiveFileLookup(`${projectRoot}/src`, targetFiles);

        fileNames.forEach(async (fileName) => {
          if (!fsTree[targetPath]) {
            let treeEntry = {
              targetLine: null,
              originalContent: null,
              transpiledContent: null,
              executed: false
            }

            await callback(targetPath, treeEntry);

            return Object.assign(fsTree, { [`${targetPath}`]: treeEntry });
          }
        });
      }
    } catch (error) {
      console.log(error);

      return process.exit(1);
    }
  }, initialFsTree);
}
// let tree = Object.assign(tree, directoryReader(config, inputs, (fileReference) => {
//   import(`${file}`);
// }));
