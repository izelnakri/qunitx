import fs from 'fs/promises';
import findProjectRoot from './find-project-root.js';

// { fileOrFolderInputs: [], projectRoot: '', browser: true, debug: true, watch: true, failFast: true, reporter: '', coverage: true , htmls: [], outputPath }
export default async function() {
  const projectRoot = await findProjectRoot();
  const packageJSON = await fs.readFile(`${projectRoot}/package.json`);
  const projectConfig = JSON.parse(packageJSON.toString()).qunitx;
  const defaultValues = {...projectConfig, projectRoot };
  const providedFlags = process.argv.slice(2).reduce((result, arg) => {
    if (arg.startsWith('--browser')) {
      return Object.assign(result, { browser: parseBoolean(arg.split('=')[1]) });
    } else if (arg.startsWith('--debug')) {
      return Object.assign(result, { debug: parseBoolean(arg.split('=')[1]) });
    } else if (arg.startsWith('--watch')) {
      return Object.assign(result, { watch: parseBoolean(arg.split('=')[1]) });
    } else if (arg.startsWith('--failfast') || arg.startsWith('--failFast')) {
      return Object.assign(result, { failFast: parseBoolean(arg.split('=')[1]) });
    } else if (arg.startsWith('--timeout')) {
      return Object.assign(result, { timeout: arg.split('=')[1] || 10000 });
    } else if (arg.startsWith('--coverage')) {
      return Object.assign(result, { coverageDist: arg.split('=')[1] || './dist' });
    } else if (arg.startsWith('--reporter')) {
      return Object.assign(result, { reporter: arg.split('=')[1] || 'tap-difflet' });
    } else if (arg.startsWith('--outputPath')) {
      return Object.assign(result, { outputPath: arg.split('=')[1] });
    } else if (arg.endsWith('.html')) {
      if (result.htmlPaths) {
        result.htmlPaths.push(arg);
      } else {
        result.htmlPaths = [arg];
      }

      return result;
    } else if (arg.startsWith('--httpPort')) {
      return Object.assign(result, { httpPort: Number(arg.split('=')[1]) });
    }

    result.fileOrFolderInputs.push(arg);

    return result;
  }, { fileOrFolderInputs: [] });

  // console.log('providedFlags', providedFlags);
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
