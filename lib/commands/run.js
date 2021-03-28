// let tree = Object.assign(tree, directoryReader(config, inputs, (file) => {
//   import(`${file}`);
// }));
// TODO: make it run an in-memory html if not exists

import fs from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import kleur from 'kleur';
import esbuild from 'esbuild';
import setupWebsocketServer from '../setup/websocket-server.js';
import setupBrowser from '../setup/browser.js';
import parseFsInputs from '../utils/parse-fs-inputs.js';
import TAPDisplayFinalResult from '../tap/display-final-result.js';
import defaultProjectConfigValues from '../boilerplates/default-project-config-values.js';


const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function(config) {
  const { browser, fileOrFolderInputs, projectRoot, timeout, output } = config;

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
      outfile: `${projectRoot}/${output}/tests.js`
    });

    let [QUnitCSS, allTestCode] = await Promise.all([
      fs.readFile(`${process.cwd()}/node_modules/qunit/qunit/qunit.css`),
      fs.readFile(`${projectRoot}/${output}/tests.js`)
    ]);
    let htmlBuffers = config.htmlPaths
      await Promise.all(config.htmlPaths.map((htmlPath) => fs.readFile(`${projectRoot}/${htmlPath}`))); // TODO: remove this and read it from the fsTree

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

    if (!codeInputs.mainHTML || !codeInputs.mainHTML.html) {
      codeInputs.mainHTML = {
        fileName: '/',
        html: (await fs.readFile(`${__dirname}/../boilerplates/setup/tests.hbs`)).toString()
      }
    }

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
