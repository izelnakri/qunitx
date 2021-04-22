import fs from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';
import setupBrowser from '../../setup/browser.js';
import parseFsInputs from '../../utils/parse-fs-inputs.js';
import timeCounter from '../../utils/time-counter.js';
import TAPDisplayFinalResult from '../../tap/display-final-result.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function runTestsInBrowser(
  fileOrFolderInputs,
  config,
  cachedContent = {},
  { page, browser, server, WebSocketServer } = { page: null, browser: null, server: null, WebSocketServer: null }
) {
  const { projectRoot, timeout, output } = config;
  const fsTree = await parseFsInputs(fileOrFolderInputs, {}, async(targetPath, fsEntry) => {
    fsEntry.executed = false;
  }, config);

  try {
    await esbuild.build({
      stdin: {
        contents: Object.keys(fsTree).reduce((result, fileAbsolutePath) => {
          return result + `import "${fileAbsolutePath}";`
        }, ''),
        resolveDir: process.cwd()
      },
      bundle: true,
      logLevel: 'error',
      outfile: `${projectRoot}/${output}/tests.js`
    }); // NOTE: This prevents file cache most likely
    cachedContent.allTestCode = await fs.readFile(`${projectRoot}/${output}/tests.js`);
    // TODO: should I check something from config.htmlPaths at this point in the future?? NOTE: let htmlBuffers = await Promise.all(config.htmlPaths.map((htmlPath) => fs.readFile(`${projectRoot}/${htmlPath}`)));

    let TIME_COUNTER = timeCounter();

    await setupBrowser(config, cachedContent, { page, browser, server, WebSocketServer });

    let TIME_TAKEN = TIME_COUNTER.stop()

    TAPDisplayFinalResult(config.COUNTER, TIME_TAKEN);

    if (!config.watch) {
      await Promise.all([
        server.close(),
        browser.close(),
        WebSocketServer.close()
      ]);

      return process.exit(config.COUNTER.failCount > 0 ? 1 : 0);
    }
  } catch(error) {
    let exception = new BundleError(error);

    if (config.watch) {
      console.log(`# ${exception}`);
    } else {
      throw exception;
    }
  }

  return { page, browser, server, WebSocketServer };
}

class BundleError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BundleError';
    this.message = `esbuild Bundle Error: ${message}`.split('\n').join('\n# ');
  }
}
