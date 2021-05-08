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
  let [fileReferences, folderReferences] = userFileOrFolderInputs.reduce((result, input) => {
    if (pathIsFile(input)) {
      result[0].push({
        input,
        isFileReference: true,
        isGlob: picomatch.scan(input).isGlob,
      });
    } else {
      result[1].push({
        input,
        isFileReference: false,
        isGlob: picomatch.scan(input).isGlob,
      });
    }

    return result;
  }, [[], []]);

  // TODO: optimize this costly call if you can:
  let filteredDownFolderResults = Array.from(folderReferences.reduce((result, folderDefinition, folderIndex) => {
    let foundDirectory = findBaseFolderDefinitionInArray(folderReferences, folderDefinition, folderIndex);
    if (foundDirectory) {
      result.add(foundDirectory);
    } else {
      result.add(folderDefinition);
    }

    return result;
  }, new Set([]))); // NOTE: We keep this solely because of foundDirectory lookup, it uniqs foundDirectories to filter it down(maybe not needed)
  let result = Array.from(filteredDownFolderResults);

  fileReferences.forEach((fileReference) => {
    if (!fileIncludedInFolders(result, fileReference)) {
      result.push(fileReference);
    }
  }, []);

  return result.map((metaItem) => metaItem.input);
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
      result = arrayItem;
      return true;
    } else if (picomatch.isMatch(targetArrayItem, targetItem, { bash: true })) {
      result = item;
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
    } else if (metaReference.input.endsWith('*')) { // NOTE: could be problematic in future, investigate if I should check endsWith /*
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
