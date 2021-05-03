import chokidar from 'chokidar';
import kleur from 'kleur';

// TODO: if needed add reload with broadcastMessage(--autorefresh)
export default async function fileWatcher(userFileOrFolderInputs, closure, closureOnFinish, config) {
  // NOTE: get from the closure

  return {
    watcher: buildWatchers(userFileOrFolderInputs, closure, closureOnFinish, config),
    killWatchers: () => cleanWatchers(watcher)
  };

  function buildWatchers(userFileOrFolderInputs, closure, closureOnFinish, config) {
    return userFileOrFolderInputs.reduce((watcher, input) => {
      return Object.assign(watcher, {
        [input]: watch(input, (path, event) => closure(path), closureOnFinish)
      });
    }, {});
  }

  function watch(watchPath, buildFunction, callback) {
    return chokidar.watch(watchPath, { ignoreInitial: true }).on('all', (event, path) => {
      if (!global.chokidarBuild) {
        global.chokidarBuild = true;

        console.log('#', kleur.magenta().bold('===================================================================='));
        console.log('#', getEventColor(event), path.split(config.projectRoot)[1]);
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
}

function cleanWatchers(watcher) {
  Object.keys(watcher).forEach((watcherKey) => watcher[watcherKey].close());

  return watcher;
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
