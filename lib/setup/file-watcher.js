import chokidar from 'chokidar';
import kleur from 'kleur';

// TODO: if needed add reload with broadcastMessage(--autorefresh)
export default async function setupFileWatchers(projectRoot, userFileOrFolderInputs, afterEventFunction, closureOnFinish) {
  let fileWatchers = buildWatchers(projectRoot, userFileOrFolderInputs, afterEventFunction, closureOnFinish);

  return {
    fileWatchers,
    killFileWatchers() {
      Object.keys(fileWatchers).forEach((watcherKey) => fileWatchers[watcherKey].close());

      return fileWatchers;
    }
  };
}

function buildWatchers(projectRoot, userFileOrFolderInputs, afterEventFunction, finalFunction) {
  return userFileOrFolderInputs.reduce((watcher, input) => {
    return Object.assign(watcher, {
      [input]: watch(projectRoot, input, (path, event) => afterEventFunction(path), finalFunction)
    });
  }, {});
}

function watch(projectRoot, watchPath, buildFunction, callback) {
  return chokidar.watch(watchPath, { ignoreInitial: true }).on('all', (event, path) => {
    if (!global.chokidarBuild) {
      global.chokidarBuild = true;

      console.log('#', kleur.magenta().bold('===================================================================='));
      console.log('#', getEventColor(event), path.split(projectRoot)[1]);
      console.log('#', kleur.magenta().bold('===================================================================='));

      let result = pathIsForBuild(path) ? buildFunction(path) : null;

      if (!(result instanceof Promise)) {
        global.chokidarBuild = false;

        return result;
      }

      result
        .then(() => {
          callback ? callback(path, event) : null;
        })
        .catch(() => {
          // TODO: make an index.html to display the error
          // error type has to be derived from the error!
        })
        .finally(() => (global.chokidarBuild = false));
    }
  });
}

function pathIsForBuild(path) {
  return ['.js', '.ts', '.html'].some((extension) => path.endsWith(extension));
}

function getEventColor(event) {
  if (event === 'change') {
    return kleur.yellow('CHANGED:');
  } else if (event === 'add' || event === 'addDir') {
    return kleur.green('ADDED:');
  } else if (event === 'unlink' || event === 'unlinkDir') {
    return kleur.red('REMOVED:');
  }
}
