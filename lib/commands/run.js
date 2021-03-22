// test/foo.js test/bar.js test/feedback/**/*.ts test/logout app/e2e/submit-\w+.ts

// let tree = Object.assign(tree, directoryReader(config, inputs, (file) => {
//   import(`${file}`);
// }));

import fs from 'fs/promises';
import kleur from 'kleur';
import esbuild from 'esbuild';
import setupWebsocketServer from '../setup/websocket-server.js';
import setupBrowser from '../setup/browser.js';
import parseFsInputs from '../utils/parse-fs-inputs.js';
import TAPDisplayFinalResult from '../tap/display-final-result.js';

export default async function(config) {
  const { browser, fileOrFolderInputs, projectRoot, timeout } = config;

  if (browser) {
    let COUNTER = { testCount: 0, failCount: 0, skipCount: 0, passCount: 0, errorCount: 0 };
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

    let [QUnitCSS, allTestCode] = await Promise.all([
      fs.readFile(`${process.cwd()}/node_modules/qunit/qunit/qunit.css`),
      fs.readFile(`${projectRoot}/tmp/tests.js`)
    ]);
    let htmlBuffers = await Promise.all(config.htmlPaths.map((htmlPath) => fs.readFile(htmlPath))); // TODO: remove this and read it from the fsTree
    let codeInputs = config.htmlPaths.reduce((result, htmlPath, index) => {
      let fileName = config.htmlPaths[index];
      let html = htmlBuffers[index].toString();

      if (!html.includes('{{content}}')) {
        result.staticHTMLs[fileName] = html;
      } else {
        result.dynamicContentHTMLs[fileName] = html;
      }

      if (!result.mainHTML) {
        let targetFileName = Object.keys(result.dynamicContentHTMLs)[0] || Object.keys(result.staticHTMLs)[0];

        result.mainHTML = {
          fileName: '/',
          html: result.dynamicContentHTMLs[targetFileName] || result.staticHTMLs[targetFileName]
        };
      }

      return result;
    }, {
      QUnitCSS: QUnitCSS.toString(),
      allTestCode: allTestCode.toString(),
      mainHTML: null,
      staticHTMLs: {},
      dynamicContentHTMLs: {}
    });

    // TODO: make these async end
    let MBER_TEST_TIME_COUNTER = (function() {
      const startTime = new Date();

      return {
        start: startTime,
        stop: () => +(new Date()) - (+startTime)
      };
    })();
    let { browser, server, WebSocketServer } = await setupBrowser(COUNTER, config, codeInputs);

    let TIME_TAKEN = MBER_TEST_TIME_COUNTER.stop()

    TAPDisplayFinalResult(COUNTER, TIME_TAKEN);

    // TODO: chokidar watch and run per test/file a test depends on? - big problem? run all?
    if (!config.watch) {
      await Promise.all([
        server.close(),
        browser.close(),
        WebSocketServer.close()
      ]);

      process.exit(COUNTER.failCount > 0 ? 1 : 0);
    }
  } else {
    global.testTimeout = timeout;
    const QUnit = (await import('../setup/node-js-environment.js')).default;
    const fsTree = await parseFsInputs(fileOrFolderInputs, {}, async(targetPath, fsEntry) => {
      // try {
        await import(targetPath);
      // } catch(error) {
      // }
      fsEntry.executed = true;
    }, config);
    console.log('TAP version 13');

    QUnit.start();

  }
}
