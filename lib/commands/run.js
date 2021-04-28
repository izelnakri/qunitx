import path from 'path';
import fs from 'fs/promises';
import kleur from 'kleur';
import cheerio from 'cheerio';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import runTestsInNode from './run/tests-in-node.js';
import runTestsInBrowser from './run/tests-in-browser.js';
import setupBrowser from '../setup/browser.js';
import fileWatcher from '../setup/file-watcher.js';
import findInternalAssetsFromHTML from '../utils/find-internal-assets-from-html.js';
import setupNodeJSEnvironment from '../setup/node-js-environment.js';
import writeOutputStaticFiles from '../setup/write-output-static-files.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function(config) {
  if (config.browser) {
    let cachedContent = await buildCachedContentTree(config, config.htmlPaths);

    let [connections, _] = await Promise.all([
      setupBrowser(config, cachedContent),
      writeOutputStaticFiles(config, cachedContent)
    ]);

    await runTestsInBrowser(config.fileOrFolderInputs, config, cachedContent, connections);

    if (config.watch) {
      logWatcherAndKeyboardShortcutInfo(config);

      await fileWatcher(config.fileOrFolderInputs, async (file) => {
        await runTestsInBrowser([file], config, cachedContent, connections);
      }, (path, event) => connections.server.publish('refresh', `${event}: ${path}`), config);
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

async function buildCachedContentTree(config, htmlPaths) {
  let htmlBuffers = await Promise.all(config.htmlPaths.map((htmlPath) => fs.readFile(htmlPath)));   // TODO: remove this and read it from the fsTree, should be cached?
  let cachedContent = htmlPaths.reduce((result, htmlPath, index) => {
    let filePath = config.htmlPaths[index];
    let html = htmlBuffers[index].toString();

    if (html.includes('{{content}}')) { // TODO: here I could do html analysis to see which static js certain html points to? Complex algorithm
      result.dynamicContentHTMLs[filePath] = html;

      let relativePath = filePath.replace(config.projectRoot, '');

      result.htmlPathsToRunTests.push(relativePath);
    } else {
      console.log('#', kleur.yellow(`WARNING: Static html file with no {{content}} detected. Therefore ignoring ${filePath}`));
      result.staticHTMLs[filePath] = html;
    }

    findInternalAssetsFromHTML(html).forEach((key) => {
      result.assets.add(normalizeInternalAssetPathFromHTML(config.projectRoot, key, filePath))
    });

    return result;
  }, {
    allTestCode: null,
    assets: new Set(),
    htmlPathsToRunTests: [],
    mainHTML: { filePath: null, html: null },
    staticHTMLs: {},
    dynamicContentHTMLs: {}
  });

  if (cachedContent.htmlPathsToRunTests.length === 0) {
    cachedContent.htmlPathsToRunTests = ['/'];
  }

  return await addCachedContentMainHTML(config.projectRoot, cachedContent);
}

async function addCachedContentMainHTML(projectRoot, cachedContent) {
  let mainHTMLPath = Object.keys(cachedContent.dynamicContentHTMLs)[0];
  if (mainHTMLPath) {
    cachedContent.mainHTML = {
      filePath: mainHTMLPath,
      html: cachedContent.dynamicContentHTMLs[mainHTMLPath]
    };
  } else {
    let html = (await fs.readFile(`${__dirname}/../boilerplates/setup/tests.hbs`)).toString();

    cachedContent.mainHTML = { filePath: `${projectRoot}/test/tests.html`, html };
    cachedContent.assets.add(`${projectRoot}/node_modules/qunitx/vendor/qunit.css`);
  }

  return cachedContent;
}



function logWatcherAndKeyboardShortcutInfo(config) {
  if (config.browser) {
    console.log('#', kleur.blue(`Watching files. Feel free to browse the tests on http://localhost:${config.httpPort} ...`)); // NOTE: maybe add also qx to exit
  } else {
    console.log('#', kleur.blue(`Watching files...`)); // NOTE: maybe add also qx to exit
  }

  // console.log('# Watching files.. Press "qa" to run all the tests, "ql" to run last failing test'); // NOTE: maybe add also qx to exit
}

function normalizeInternalAssetPathFromHTML(projectRoot, assetPath, htmlPath) { // NOTE: maybe normalize ..
  let currentDirectory = htmlPath ? htmlPath.split('/').slice(0, -1).join('/') : projectRoot;

  return assetPath.startsWith('./')
    ? path.normalize(`${currentDirectory}/${assetPath.slice(2)}`)
    : path.normalize(`${currentDirectory}/${assetPath}`);
}
