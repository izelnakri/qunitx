import chokidar from 'chokidar';
import kleur from 'kleur';

export default async function setupFileWatchers(testFileLookupPaths, config, onEventFunc, onFinishFunc) {
  let extensions = ['js', 'ts'];
  let fileWatchers = testFileLookupPaths.reduce((watcher, watchPath) => {
    return Object.assign(watcher, {
      [watchPath]: chokidar.watch(watchPath, { ignoreInitial: true }).on('all', (event, path) => {
        if (extensions.some((extension) => path.endsWith(extension))) {
          mutateFSTree(config.fsTree, event, path);

          console.log('#', kleur.magenta().bold('=================================================================='));
          console.log('#', getEventColor(event), path.split(config.projectRoot)[1]);
          console.log('#', kleur.magenta().bold('=================================================================='));

          if (!global.chokidarBuild) {
            global.chokidarBuild = true;

            let result = extensions.some((extension) => path.endsWith(extension)) ? onEventFunc(event, path) : null;

            if (!(result instanceof Promise)) {
              global.chokidarBuild = false;

              return result;
            }

            result
              .then(() => {
                onFinishFunc ? onFinishFunc(event, path) : null;
              })
              .catch(() => {
                // TODO: make an index.html to display the error
                // error type has to be derived from the error!
              })
              .finally(() => (global.chokidarBuild = false));
          }
        }
      })
    });
  }, {});

  return {
    fileWatchers,
    killFileWatchers() {
      Object.keys(fileWatchers).forEach((watcherKey) => fileWatchers[watcherKey].close());

      return fileWatchers;
    }
  };
}

function mutateFSTree(fsTree, event, path) {
  if (event === 'add') {
    fsTree[path] = null;
  } else if (event === 'unlink') {
    delete fsTree[path];
  } else if (event === 'unlinkDir') {
    let targetPaths = Object.keys(config.fsTree).filter((treePath) => treePath.startsWith(path));

    targetPaths.forEach((path) => delete config.fsTree[path]);
  }
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
