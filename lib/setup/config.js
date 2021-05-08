import fs from 'fs/promises';
import picomatch from 'picomatch';
import defaultProjectConfigValues from '../boilerplates/default-project-config-values.js';
import findProjectRoot from '../utils/find-project-root.js';
import parseCliFlags from '../utils/parse-cli-flags.js';

export default async function setupConfig() {
  let [cliConfigFlags, { projectRoot, packageJSONConfig }] = await Promise.all([
    parseCliFlags(),
    readConfigFromPackageJSON()
  ]);
  let config = {
    projectRoot,
    htmlPaths: [],
    lastFailedTestFiles: null,
    lastRanTestFiles: null,
    ...defaultProjectConfigValues,
    ...packageJSONConfig.qunitx,
    ...cliConfigFlags, // NOTE: creates userFileOrFolderInputs[]
  };
  config.htmlPaths = normalizeHTMLPaths(config.projectRoot, config.htmlPaths);
  config.watchPaths = buildWatchPaths(config.projectRoot, config.userFileOrFolderInputs);
  // config.fsTree = await buildFSTree(config.userFileOrFolderInputs) // this should be flat -> [absolutePath]: [content]

  return config;
}

async function readConfigFromPackageJSON() {
  let projectRoot = await findProjectRoot();
  let packageJSON = await fs.readFile(`${projectRoot}/package.json`);
  let packageJSONConfig = JSON.parse(packageJSON.toString());

  return { projectRoot, packageJSONConfig };
}

function normalizeHTMLPaths(projectRoot, htmlPaths) {
  return Array.from(new Set(htmlPaths.map((htmlPath) => `${projectRoot}/${htmlPath}`)));
}

export function buildWatchPaths(projectRoot, userFileOrFolderInputs) {
  let foldersWithGlobs = [];
  let foldersWithoutGlobs = [];
  let filesWithGlobs = [];
  let filesWithoutGlobs = [];

  userFileOrFolderInputs.forEach((input) => {
    let inputIsFile = pathIsFile(input);

    let scan = picomatch.scan(input);
    if (scan.isGlob) {
      if (inputIsFile) {
        filesWithGlobs.push({ input, isGlob: true, isFileReference: true })
      } else {
        foldersWithGlobs.push({ input, isGlob: true, isFileReference: false });
      }
    } else {
      if (inputIsFile) {
        filesWithoutGlobs.push({ input, isGlob: false, isFileReference: true })
      } else {
        foldersWithoutGlobs.push({ input, isGlob: false, isFileReference: false });
      }
    }
  });

  let allFolders = foldersWithGlobs.concat(foldersWithoutGlobs); // TODO: I dont need to concat most likely(?) if I start from foldersWithGlobs?
  let filteredDownFolderResults = Array.from(allFolders.reduce((result, folderDefinition, folderIndex) => {
    let foundDirectory = findBaseFolderDefinitionInArray(allFolders, folderDefinition, folderIndex);
    if (foundDirectory) {
      result.add(foundDirectory);
    } else {
      result.add(folderDefinition.input);
    }

    return result;
  }, new Set([])));

  let resultWithMeta = Array.from(filteredDownFolderResults).map((folderInput) => {
    return allFolders.find((folderMeta) => folderMeta.input === folderInput);
  });

  filesWithGlobs.concat(filesWithoutGlobs).forEach((fileReference) => {
    if (!fileIncludedInFolders(resultWithMeta, fileReference)) {
      resultWithMeta.push(fileReference);
    }
  });

  return resultWithMeta.map((metaItem) => metaItem.input);
}

function findBaseFolderDefinitionInArray(array, item, itemIndex) {
  let targetItem = item.isGlob ? item.input : `${item.input}/*`;

  let result;
  array.find((arrayItem, index) => { // NOTE: short circuit array iteration
    if (index === itemIndex) {
      return;
    }

    let targetArrayItem = arrayItem.isGlob ? arrayItem.input : `${arrayItem.input}/*`;
    if (picomatch.isMatch(targetItem, targetArrayItem, { bash: true })) {
      result = arrayItem.input;
      return true;
    } else if (picomatch.isMatch(targetArrayItem, targetItem, { bash: true })) {
      result = item.input;
      return true;
    }
  });

  return result;
}

function fileIncludedInFolders(metaReferences, fileReference) {
  return metaReferences.some((metaReference) => {
    let rightReference = getRightReference(metaReference);

    return picomatch.isMatch(fileReference.input, rightReference, { bash: true });
  });
}

function getRightReference(metaReference) {
  if (!metaReference.isFileReference) {
    if (!metaReference.isGlob) {
      return `${metaReference.input}/*`;
    } else if (metaReference.input.endsWith('*')) { // NOTE: could be problematic
      return metaReference.input;
    }

    return `${metaReference.input}/*`;
  }

  return metaReference.input;
}

function pathIsFile(path) {
  let inputs = path.split('/');

  return inputs[inputs.length - 1].includes('.');
}
}
