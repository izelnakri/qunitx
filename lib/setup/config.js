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

export function buildWatchPaths(projectRoot, userFileOrFolderInputs) { // NOTE: very complex algorithm, order is very important
  let [folders, filesWithGlob, filesWithoutGlob] = userFileOrFolderInputs.reduce((result, input) => {
    let isGlob = picomatch.scan(input).isGlob;

    if (!pathIsFile(input)) {
      result[0].push({
        input,
        isFile: false,
        isGlob
      });
    } else {
      result[isGlob ? 1 : 2].push({
        input,
        isFile: true,
        isGlob
      });
    }

    return result;
  }, [[], [], []]);
  let result = folders.reduce((folderResult, folder, folderIndex) => {
    if (!pathIncludedInFolders(folders, folder, folderIndex)) {
      folderResult.push(folder);
    }

    return folderResult;
  }, []);

  filesWithGlob.forEach((file, fileIndex) => {
    if (
      !pathIncludedInFolders(result, file) &&
      !pathIncludedInFolders(filesWithGlob, file, fileIndex)
    ) {
      result.push(file);
    }
  });
  filesWithoutGlob.forEach((file) => {
    if (!pathIncludedInFolders(result, file)) {
      result.push(file);
    }
  });

  return result.map((metaItem) => metaItem.input);
}

function pathIsFile(path) {
  let inputs = path.split('/');

  return inputs[inputs.length - 1].includes('.');
}

function pathIncludedInFolders(paths, targetPath, targetPathIndex) {
  return paths.some((path, pathIndex) => {
    if (targetPathIndex && pathIndex === targetPathIndex) {
      return false;
    }

    let globFormat = buildGlobFormat(path);

    return picomatch.isMatch(targetPath.input, globFormat, { bash: true });
  });
}

function buildGlobFormat(path) {
  if (!path.isFile) {
    if (!path.isGlob) {
      return `${path.input}/*`;
    } else if (path.input.endsWith('*')) { // NOTE: could be problematic in future, investigate if I should check endsWith /*
      return path.input;
    }

    return `${path.input}/*`;
  }

  return path.input;
}

    }

}
