import picomatch from 'picomatch';

export default function setupTestFilePaths(projectRoot, inputs) { // NOTE: very complex algorithm, order is very important
  let [folders, filesWithGlob, filesWithoutGlob] = inputs.reduce((result, input) => {
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

  let result = folders.reduce((folderResult, folder) => {
    if (!pathIsIncludedInPaths(folders, folder)) {
      folderResult.push(folder);
    }

    return folderResult;
  }, []);

  filesWithGlob.forEach((file) => {
    if (
      !pathIsIncludedInPaths(result, file) &&
      !pathIsIncludedInPaths(filesWithGlob, file)
    ) {
      result.push(file);
    }
  });
  filesWithoutGlob.forEach((file) => {
    if (!pathIsIncludedInPaths(result, file)) {
      result.push(file);
    }
  });

  return result.map((metaItem) => metaItem.input);
}

function pathIsFile(path) {
  let inputs = path.split('/');

  return inputs[inputs.length - 1].includes('.');
}

function pathIsIncludedInPaths(paths, targetPath) {
  return paths.some((path) => {
    if (path === targetPath) {
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
