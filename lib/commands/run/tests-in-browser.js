import fs from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';
import setupBrowser from '../../setup/browser.js';
import parseFsInputs from '../../utils/parse-fs-inputs.js';
import TAPDisplayFinalResult from '../../tap/display-final-result.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function runTestsInBrowser(fileOrFolderInputs, config, cachedContent = {}, connections) {
  const { projectRoot, timeout, output } = config;

  const fsTree = await parseFsInputs(fileOrFolderInputs, {}, async(targetPath, fsEntry) => {
    fsEntry.executed = false;
  }, config);

  // This prevents file cache most likely
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
  });

  cachedContent.allTestCode = await fs.readFile(`${projectRoot}/${output}/tests.js`);
  // TODO: should I check something from config.htmlPaths at this point in the future?? NOTE: let htmlBuffers = await Promise.all(config.htmlPaths.map((htmlPath) => fs.readFile(`${projectRoot}/${htmlPath}`)));

  let MBER_TEST_TIME_COUNTER = (function() {
    const startTime = new Date();

    return {
      start: startTime,
      stop: () => +(new Date()) - (+startTime)
    };
  })();

  let { browser, server, WebSocketServer } = await setupBrowser(config, cachedContent, connections); // NOTE: this is cachedContent

  let TIME_TAKEN = MBER_TEST_TIME_COUNTER.stop()

  TAPDisplayFinalResult(config.COUNTER, TIME_TAKEN);

  if (!config.watch) {
    await Promise.all([
      server.close(),
      browser.close(),
      WebSocketServer.close()
    ]);

    return process.exit(config.COUNTER.failCount > 0 ? 1 : 0);
  }

  return { server, browser, WebSocketServer };
}