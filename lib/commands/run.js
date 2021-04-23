import fs from 'fs/promises';
import cheerio from 'cheerio';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import runTestsInNode from './run/tests-in-node.js';
import runTestsInBrowser from './run/tests-in-browser.js';
import fileWatcher from '../setup/file-watcher.js';
import setupNodeJSEnvironment from '../setup/node-js-environment.js';
import writeOutputStaticFiles from '../setup/write-output-static-files.js';
import WebSocket from 'ws';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function(config) {
  if (config.browser) {
    let QUNIT_PATH = `${__dirname}/../../vendor/qunit.css`;
    let [QUnitCSS, ...htmlBuffers] = await Promise.all([
      fs.readFile(QUNIT_PATH),
    ].concat(config.htmlPaths.map((htmlPath) => fs.readFile(`${config.projectRoot}/${htmlPath}`)))); // TODO: remove this and read it from the fsTree, should be cached?

    console.log(config.htmlPaths);
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

      findInternalAssetsFromHTML(html).forEach((key) => result.assets.add(key));

      return result;
    }, {
      QUnitCSS: QUnitCSS.toString(),
      allTestCode: null,
      assets: new Set(),
      mainHTML: null,
      staticHTMLs: {},
      dynamicContentHTMLs: {}
    });

    console.log(cachedContent);
    if (!cachedContent.mainHTML || !cachedContent.mainHTML.html) {
      let html = (await fs.readFile(`${__dirname}/../boilerplates/setup/tests.hbs`)).toString();

      cachedContent.mainHTML = { fileName: '/', html };
      findInternalAssetsFromHTML(html).forEach((key) => cachedContent.assets.add(key));
    }

    // TODO: at this point allTests dont exist to write index.html from a dynamicHTML
    await writeOutputStaticFiles(config, cachedContent);

    const { server, page, WebSocketServer, browser } = await runTestsInBrowser(config.fileOrFolderInputs, config, cachedContent);

    if (config.watch) {
      logWatcherAndKeyboardShortcutInfo(config);

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

function logWatcherAndKeyboardShortcutInfo(config) {
  if (config.browser) {
    console.log(`# Watching files. Feel free to browse the tests on http://localhost:${config.httpPort} ...`); // NOTE: maybe add also qx to exit
  } else {
    console.log('# Watching files...'); // NOTE: maybe add also qx to exit
  }

  // console.log('# Watching files.. Press "qa" to run all the tests, "ql" to run last failing test'); // NOTE: maybe add also qx to exit
}

function findInternalAssetsFromHTML(htmlContent) {
  const ABSOLUTE_URL_REGEX = new RegExp('^(?:[a-z]+:)?//', 'i');
  const $ = cheerio.load(htmlContent);
  const internalJSFiles = $('script[src]').toArray()
    .map((scriptNode) => $(scriptNode).attr('src'))
    .filter((uri) => !ABSOLUTE_URL_REGEX.test(uri));
  const internalCSSFiles = $('link[href]').toArray()
    .map((scriptNode) => $(scriptNode).attr('href'))
    .filter((uri) => !ABSOLUTE_URL_REGEX.test(uri));

  return internalCSSFiles.concat(internalJSFiles);
    // TODO: maybe needs normalization ? .map((fileReferencePath) => fileReferencePath.replace('/assets', `${projectRoot}/tmp/assets`));
}
