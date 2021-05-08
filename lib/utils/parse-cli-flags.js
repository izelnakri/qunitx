import fs from 'fs/promises';

// { userFileOrFolderInputs: [], browser: true, debug: true, watch: true, failFast: true, reporter: '', coverage: true , htmlPaths: [], output }
export default async function() {
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
    } else if (arg.startsWith('--output')) {
      return Object.assign(result, { output: arg.split('=')[1] });
    } else if (arg.endsWith('.html')) {
      if (result.htmlPaths) {
        result.htmlPaths.push(arg);
      } else {
        result.htmlPaths = [arg];
      }

      return result;
    } else if (arg.startsWith('--port')) {
      return Object.assign(result, { port: Number(arg.split('=')[1]) });
    }

    // check if it is a glob then add respective files, //  TODO: also watch for globs??(how)
    // maybe set watch depth via micromatch(so incl metadata)
    result.userFileOrFolderInputs.add(`${process.cwd()}/${arg}`);

    return result;
  }, { userFileOrFolderInputs: new Set([]) });

  providedFlags.userFileOrFolderInputs = Array.from(providedFlags.userFileOrFolderInputs);

  return providedFlags;
}

function parseBoolean(result, defaultValue=true) {
  if (result === 'true') {
    return true;
  } else if (result === 'false') {
    return false;
  }

  return defaultValue;
}
