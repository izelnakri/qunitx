import fs from 'fs/promises';
import kleur from 'kleur';
import recursiveFileLookup from './recursive-file-lookup.js';

export default async function(fsInputs=[], initialFsTree={}, callback=async () => {}, config={}) {
  return fsInputs.reduce(async (fsTree, fsReference, index) => {
    fsTree = await fsTree;
    if (!config.browser && fsReference.endsWith('.ts')) {
      let targetPath = `${process.cwd()}/${fsReference}`;

      console.error(kleur.red(`qunitx cannot run ${targetPath} without --browser`));
      process.exit(1);
    }

    // TODO: maybe format './', 'asd', '/asdasd' for fsReference
    // TODO: try checking for linenumbers refs

    try {
      const entry = await fs.stat(fsReference);
      const targetPath = `${process.cwd()}/${fsReference}`;

      if (entry.isFile()) { // handle what to do when its .ts
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
        let fileNames = await recursiveFileLookup(targetPath, targetFiles);

        fsTree = fileNames.reduce(async (fsTree, fileName) => {
          fsTree = await fsTree;
          if (!fsTree[fileName]) {
            let treeEntry = {
              targetLine: null,
              originalContent: null,
              transpiledContent: null,
              executed: false
            }

            await callback(fileName, treeEntry);

            return Object.assign(fsTree, { [`${fileName}`]: treeEntry });
          }

          return fsTree;
        }, fsTree);
      }

      return fsTree;
    } catch (error) {
      console.error(error);

      return process.exit(1);
    }
  }, initialFsTree);
}
// let tree = Object.assign(tree, directoryReader(config, inputs, (fileReference) => {
//   import(`${file}`);
// }));
