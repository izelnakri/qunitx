import pathExists from './path-exists.js';

async function searchInParentDirectories(directory, targetEntry) {
  directory = directory === '.' ? process.cwd() : directory;

  if (await pathExists(`${directory}/${targetEntry}`)) {
    return `${directory}/${targetEntry}`;
  } else if (directory === '') {
    return;
  }

  return await searchInParentDirectories(directory.slice(0, directory.lastIndexOf('/')), targetEntry);
}

export default searchInParentDirectories;
