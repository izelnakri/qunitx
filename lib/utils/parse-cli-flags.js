// { inputs: [], debug: true, watch: true, failFast: true, htmlPaths: [], output }
export default async function(projectRoot) {
  const providedFlags = process.argv.slice(2).reduce((result, arg) => {
    if (arg.startsWith('--debug')) {
      return Object.assign(result, { debug: parseBoolean(arg.split('=')[1]) });
    } else if (arg.startsWith('--watch')) {
      return Object.assign(result, { watch: parseBoolean(arg.split('=')[1]) });
    } else if (arg.startsWith('--failfast') || arg.startsWith('--failFast')) {
      return Object.assign(result, { failFast: parseBoolean(arg.split('=')[1]) });
    } else if (arg.startsWith('--timeout')) {
      return Object.assign(result, { timeout: arg.split('=')[1] || 10000 });
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
    } else if (arg.startsWith('--before')) {
      return Object.assign(result, { before: parseModule(arg.split('=')[1]) });
    } else if (arg.startsWith('--after')) {
      return Object.assign(result, { after: parseModule(arg.split('=')[1]) });
    }

    // maybe set watch depth via micromatch(so incl metadata)
    result.inputs.add(arg.startsWith(projectRoot) ? arg : `${process.cwd()}/${arg}`);

    return result;
  }, { inputs: new Set([]) });

  providedFlags.inputs = Array.from(providedFlags.inputs);

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

function parseModule(value) {
  if (['false', "'false'", '"false"', ''].includes(value)) {
    return false;
  }

  return value;
}
