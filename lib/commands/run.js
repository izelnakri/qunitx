import fs from 'node:fs/promises';
import { normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import kleur from 'kleur';
import runTestsInBrowser from './run/tests-in-browser.js';
import setupBrowser from '../setup/browser.js';
import fileWatcher from '../setup/file-watcher.js';
import findInternalAssetsFromHTML from '../utils/find-internal-assets-from-html.js';
import runUserModule from '../utils/run-user-module.js';
import setupKeyboardEvents from '../setup/keyboard-events.js';
import writeOutputStaticFiles from '../setup/write-output-static-files.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function(config) {
  let cachedContent = await buildCachedContent(config, config.htmlPaths);
  let [connections, _] = await Promise.all([
    setupBrowser(config, cachedContent),
    writeOutputStaticFiles(config, cachedContent)
  ]);
  config.expressApp = connections.server;

  if (config.watch) {
    setupKeyboardEvents(config, cachedContent, connections);
  }

  if (config.before) {
    await runUserModule(`${process.cwd()}/${config.before}`, config, 'before');
  }

  await runTestsInBrowser(config, cachedContent, connections);

  if (config.watch) {
    logWatcherAndKeyboardShortcutInfo(config, connections.server);

    await fileWatcher(
      config.testFileLookupPaths,
      config,
      async (event, file) => {
        if (event === 'addDir') {
          return;
        } else if (['unlink', 'unlinkDir'].includes(event)) {
          return await runTestsInBrowser(config, cachedContent, connections);
        }

        await runTestsInBrowser(config, cachedContent, connections, [file]);
      },
      (path, event) => connections.server.publish('refresh', 'refresh')
    );
  }
}

async function buildCachedContent(config, htmlPaths) {
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

function logWatcherAndKeyboardShortcutInfo(config, server) {
  console.log('#', kleur.blue(`Watching files... You can browse the tests on http://localhost:${config.port} ...`)); // NOTE: maybe add also qx to exit
  console.log('#', kleur.blue(`Shortcuts: Press "qq" to abort running tests, "qa" to run all the tests, "qf" to run last failing test, "ql" to repeat last test`)); // NOTE: maybe add also qx to test specific
}

function normalizeInternalAssetPathFromHTML(projectRoot, assetPath, htmlPath) { // NOTE: maybe normalize ..
  let currentDirectory = htmlPath ? htmlPath.split('/').slice(0, -1).join('/') : projectRoot;

  return assetPath.startsWith('./')
    ? normalize(`${currentDirectory}/${assetPath.slice(2)}`)
    : normalize(`${currentDirectory}/${assetPath}`);
}
