import path from 'path';
import fs from 'fs/promises';
import cheerio from 'cheerio';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import runTestsInNode from './run/tests-in-node.js';
import runTestsInBrowser from './run/tests-in-browser.js';
import fileWatcher from '../setup/file-watcher.js';
import findInternalAssetsFromHTML from '../utils/find-internal-assets-from-html.js';
import setupNodeJSEnvironment from '../setup/node-js-environment.js';
import writeOutputStaticFiles from '../setup/write-output-static-files.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function(config) {
  if (config.browser) {
    let htmlBuffers = await Promise.all(config.htmlPaths.map((htmlPath) => fs.readFile(htmlPath))); // TODO: remove this and read it from the fsTree, should be cached?
    let cachedContent = config.htmlPaths.reduce((result, htmlPath, index) => {
      let filePath = config.htmlPaths[index];
      let html = htmlBuffers[index].toString();

      if (html.includes('{{content}}')) { // TODO: here I could do html analysis to see which static js certain html points to? Complex algorithm
        result.dynamicContentHTMLs[filePath] = html;
      } else {
        result.staticHTMLs[filePath] = html;
      }

      findInternalAssetsFromHTML(html).forEach((key) => {
        result.assets.add(normalizeInternalAssetPathFromHTML(config.projectRoot, key, filePath))
      });

      return result;
    }, {
      allTestCode: null,
      assets: new Set(),
      mainHTML: null,
      staticHTMLs: {},
      dynamicContentHTMLs: {}
    });

    let mainHTMLPath = cachedContent.dynamicContentHTMLs[0]
    if (mainHTMLPath) {
      result.mainHTML = {
        filePath: mainHTMLPath,
        html: result.dynamicContentHTMLs[mainHTMLPath]
      };
    } else {
      let html = (await fs.readFile(`${__dirname}/../boilerplates/setup/tests.hbs`)).toString();

      cachedContent.mainHTML = { filePath: `${config.projectRoot}/test/tests.html`, html };
      cachedContent.assets.add(`${config.projectRoot}/node_modules/qunitx/vendor/qunit.css`);
    }

    await writeOutputStaticFiles(config, cachedContent);

    const { server, page, browser } = await runTestsInBrowser(config.fileOrFolderInputs, config, cachedContent);

    if (config.watch) {
      logWatcherAndKeyboardShortcutInfo(config);

      await fileWatcher(
        config.fileOrFolderInputs,
        async (file) => {
          await runTestsInBrowser([file], config, cachedContent, connections);
        },
        (path, event) => connections.server.publish('refresh', `${event}: ${path}`),
        config
      );
    }
  } else {
    global.testTimeout = config.timeout;

    setupNodeJSEnvironment(config);
    await runTestsInNode(config.fileOrFolderInputs, config);

    if (config.watch) {
      logWatcherAndKeyboardShortcutInfo(config);

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

function normalizeInternalAssetPathFromHTML(projectRoot, assetPath, htmlPath) { // NOTE: maybe normalize ..
  let currentDirectory = htmlPath ? htmlPath.split('/').slice(0, -1).join('/') : projectRoot;

  return assetPath.startsWith('./')
    ? path.normalize(`${currentDirectory}/${assetPath.slice(2)}`)
    : path.normalize(`${currentDirectory}/${assetPath}`);
}
