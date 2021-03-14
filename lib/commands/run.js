// test/foo.js test/bar.js test/feedback/**/*.ts test/logout app/e2e/submit-\w+.ts

// let tree = Object.assign(tree, directoryReader(config, inputs, (file) => {
//   import(`${file}`);
// }));

import fs from 'fs/promises';
import chalk from 'chalk';
import esbuild from 'esbuild';
import setupWebsocketServer from '../setup/websocket-server.js';
import setupBrowser from '../setup/browser.js';
import parseFsInputs from '../utils/parse-fs-inputs.js';
import TAPDisplayFinalResult from '../tap/display-final-result.js';

export default async function(config) {
  const { browser, fileOrFolderInputs, projectRoot } = config;

  if (browser) {
    let COUNTER = { testCount: 0, failCount: 0, skipCount: 0, passCount: 0, errorCount: 0 };
    let WebSocketServer = await setupWebsocketServer(COUNTER, config);
    const fsTree = await parseFsInputs(fileOrFolderInputs, {}, async(targetPath, fsEntry) => {
      fsEntry.executed = false;
    }, config);

    await esbuild.build({
      stdin: {
        contents: Object.keys(fsTree).reduce((result, fileAbsolutePath) => {
          return result + `import "${fileAbsolutePath}";`
        }, ''),
        resolveDir: process.cwd()
      },
      bundle: true,
      logLevel: 'error',
      outfile: `${projectRoot}/tmp/tests.js`
    });

    let allTestCode = (await fs.readFile(`${projectRoot}/tmp/tests.js`)).toString();
    let MBER_TEST_TIME_COUNTER = (function() {
      const startTime = new Date();

      return {
        start: startTime,
        stop: () => +(new Date()) - (+startTime)
      };
    })();
    let { browser, server } = await setupBrowser(config, allTestCode);
    let TIME_TAKEN = MBER_TEST_TIME_COUNTER.stop()

    TAPDisplayFinalResult(COUNTER, TIME_TAKEN);

    if (!config.watch) {
      await Promise.all([
        server.close(),
        browser.close()
      ]);

      process.exit(COUNTER.failCount > 0 ? 1 : 0);
    }
  } else {
    const QUnit = (await import('../setup/node-js-environment.js')).default;
    const fsTree = await parseFsInputs(fileOrFolderInputs, {}, async(targetPath, fsEntry) => {
      await import(targetPath);
      fsEntry.executed = true;
    }, config);
    console.log('TAP version 13');
    QUnit.start();
  }
}
