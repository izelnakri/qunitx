import fs from 'fs/promises';
import findProjectRoot from './find-project-root.js';

export default async function() {
  const projectRoot = await findProjectRoot();
  const packageJSON = await fs.readFile(`${projectRoot}/package.json`);
  const projectConfig = JSON.parse(packageJSON.toString()).qunitx;
  const defaultValues = {...projectConfig, projectRoot };
  const providedFlags = process.argv.slice(2).reduce((result, arg) => {
    if (arg.startsWith('--browser')) {
      return Object.assign(result, { browser: parseBoolean(arg.split('=')[1]) });
    } else if (args.startsWith('--debug')) {
      return Object.assign(result, { debug: parseBoolean(arg.split('=')[1]) });
    } else if (args.startsWith('--watch')) {
      return Object.assign(result, { watch: parseBoolean(arg.split('=')[1]) });
    } else if (args.startsWith('--failfast') || args.startsWith('--failFast')) {
      return Object.assign(result, { failFast: parseBoolean(arg.split('=')[1]) });
    } else if (args.startsWith('--reporter') {
      return Object.assign(result, { reporter: arg.split('=')[1] || 'spec' });
    } else if (args.startsWith('--coverage')) {
      return Object.assign(result, { coverageDist: arg.split('=')[1] || './dist' });
    }

    result.fileOrFolderInputs.push(arg);

    return result;
  }, { fileOrFolderInputs: [] });

  return Object.assign(defaultValues, projectConfig, providedFlags);
}

function parseBoolean(result, defaultValue=true) {
  if (result === 'true') {
    return true;
  } else if (result === 'false') {
    return false;
  }

  return defaultValue;
}
