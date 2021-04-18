import fs from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import runTestsInNode from './run/tests-in-node.js';
import runTestsInBrowser from './run/tests-in-browser.js';
import fileWatcher from '../setup/file-watcher.js';
import setupNodeJSEnvironment from '../setup/node-js-environment.js';
import WebSocket from 'ws';
// let tree = Object.assign(tree, directoryReader(config, inputs, (file) => {
//   import(`${file}`);
// }));
// TODO: make it run an in-memory html if not exists

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function(config) {
  config.COUNTER = { testCount: 0, failCount: 0, skipCount: 0, passCount: 0 };

  if (config.browser) {
    let [QUnitCSS, ...htmlBuffers] = await Promise.all([
      fs.readFile(`${process.cwd()}/node_modules/qunit/qunit/qunit.css`),
    ].concat(config.htmlPaths.map((htmlPath) => fs.readFile(`${projectRoot}/${htmlPath}`)))); // TODO: remove this and read it from the fsTree, should be cached?
    let cachedContent = config.htmlPaths.reduce((result, htmlPath, index) => {
      let fileName = config.htmlPaths[index];
      let html = htmlBuffers[index].toString();

      // TODO: here I could do html analysis to see which static js certain html points to? Complex algorithm
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
      allTestCode: null,
      mainHTML: null,
      staticHTMLs: {},
      dynamicContentHTMLs: {}
    });
    if (!cachedContent.mainHTML || !cachedContent.mainHTML.html) {
      cachedContent.mainHTML = {
        fileName: '/',
        html: (await fs.readFile(`${__dirname}/../boilerplates/setup/tests.hbs`)).toString()
      }
    }

    const { server, page, WebSocketServer, browser } = await runTestsInBrowser(config.fileOrFolderInputs, config, cachedContent); // NOTE: cannot do test files individually/requires bundling?

    if (config.watch) {
      logWatcherAndKeyboardShortcutInfo();

      await fileWatcher(config.fileOrFolderInputs, async (file) => {
        config.COUNTER = { testCount: 0, failCount: 0, skipCount: 0, passCount: 0 };
        // TODO: check if its html then run html otherwise run all html, how??
        await runTestsInBrowser([file], config, cachedContent, { server, page, WebSocketServer, browser })
      }, () => {}, config);
    }
  } else {
    global.testTimeout = config.timeout;

    await setupNodeJSEnvironment(config); // NOTE = (await import('../setup/node-js-environment.js')).default(config);
    await runTestsInNode(config.fileOrFolderInputs, window.QUnit, config); // NOTE: can do test files individually

    if (config.watch) {

      logWatcherAndKeyboardShortcutInfo();

      let something = await fileWatcher(config.fileOrFolderInputs, async (file) => {
        config.COUNTER = { testCount: 0, failCount: 0, skipCount: 0, passCount: 0 };
        await setupNodeJSEnvironment(config);
        await runTestsInNode([file], window.QUnit, config)
      }, () => {}, config);
    }
  }
}

function logWatcherAndKeyboardShortcutInfo() {
  console.log('# Watching files.. Press "qa" to run all the tests, "ql" to run last failing test'); // NOTE: maybe add also qx to exit
}

// Console.log(getEventColor(event), path.split(projectRoot)[1]);
function getEventColor(event) {
  if (event === 'change') {
    return chalk.yellow('CHANGED:');
  } else if (event === 'add' || event === 'addDir') {
    return chalk.green('ADDED:');
  } else if (event === 'unlink' || event === 'unlinkDir') {
    return chalk.red('REMOVED:');
  }
}
