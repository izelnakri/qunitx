import fs from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import runTestsInNode from './run/tests-in-node.js';
import runTestsInBrowser from './run/tests-in-browser.js';
import fileWatcher from '../setup/file-watcher.js';
import setupNodeJSEnvironment from '../setup/node-js-environment.js';
import WebSocket from 'ws';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function(config) {
  if (config.browser) {
    // TODO: make static css/js middleware and output all needed files to config.outputFolder

    let [QUnitCSS, ...htmlBuffers] = await Promise.all([
      fs.readFile(`${process.cwd()}/node_modules/qunit/qunit/qunit.css`),
    ].concat(config.htmlPaths.map((htmlPath) => fs.readFile(`${config.projectRoot}/${htmlPath}`)))); // TODO: remove this and read it from the fsTree, should be cached?
    let cachedContent = config.htmlPaths.reduce((result, htmlPath, index) => {
      let fileName = config.htmlPaths[index];
      let html = htmlBuffers[index].toString();

      if (!html.includes('{{content}}')) { // TODO: here I could do html analysis to see which static js certain html points to? Complex algorithm
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

    const { server, page, WebSocketServer, browser } = await runTestsInBrowser(config.fileOrFolderInputs, config, cachedContent);

    if (config.watch) {
      logWatcherAndKeyboardShortcutInfo();

      await fileWatcher(config.fileOrFolderInputs, async (file) => {
        await runTestsInBrowser([file], config, cachedContent, { server, page, WebSocketServer, browser }) // TODO: check if its html then run html otherwise run all html, how??
      }, () => {}, config);
    }
  } else {
    global.testTimeout = config.timeout;

    setupNodeJSEnvironment(config);
    await runTestsInNode(config.fileOrFolderInputs, config);

    if (config.watch) {
      logWatcherAndKeyboardShortcutInfo();

      await fileWatcher(config.fileOrFolderInputs, async (file) => {
        await runTestsInNode([file], config)
      }, () => {}, config);
    }
  }
}

function logWatcherAndKeyboardShortcutInfo() {
  console.log('# Watching files...'); // NOTE: maybe add also qx to exit
  // console.log('# Watching files.. Press "qa" to run all the tests, "ql" to run last failing test'); // NOTE: maybe add also qx to exit
}
