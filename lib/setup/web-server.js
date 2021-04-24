import path from 'path';
import http from 'http';
import express from 'express';
import fs from 'fs/promises';
import findInternalAssetsFromHTML from '../utils/find-internal-assets-from-html.js';

let app = express();

// TODO: outputted file asset references wrong on relative paths = FIX this
export default async function setupWebServer(config = {
  httpPort: 1234, debug: false, watch: false, timeout: 10000
}, cachedContent, promise) {
  // TODO: custom logger

  app.use(express.static(`${config.projectRoot}/${config.output}`)) // NOTE: add options?

  app.use('/*', async (req, res) => {
    let path = `/${req.params[0]}`;
    if (config.debug) {
      console.log(`# HTTPServer REQ: ${req.method} ${path}`);
    }

    let dynamicHTML = cachedContent.dynamicContentHTMLs[`${config.projectRoot}${path}`];
    if (dynamicHTML) { // TODO: investigate if asset paths correct
      let TEST_RUNTIME_TO_INJECT = testRuntimeToInject(req, config);
      let htmlContent = dynamicHTML
        .replace('{{content}}', TEST_RUNTIME_TO_INJECT.replace('{{allTestCode}}', cachedContent.allTestCode));

      res.send(htmlContent);

      return await fs.writeFile(`${config.projectRoot}/${config.output}${path}`, htmlContent);
    } else if (path === '/') {
      let TEST_RUNTIME_TO_INJECT = testRuntimeToInject(req, config);
      let htmlContent = replaceAssetPaths(
        cachedContent.mainHTML.html,
        cachedContent.mainHTML.filePath,
        config.projectRoot
      ).replace('{{content}}', TEST_RUNTIME_TO_INJECT.replace('{{allTestCode}}', cachedContent.allTestCode))

      res.send(htmlContent);

      return await fs.writeFile(`${config.projectRoot}/${config.output}/index.html`, htmlContent);
    }

    res.status(404).send('Not found');
  });

  // TODO: occasionally wrong content is served!! beter error messages?
  const server = http.createServer(app);

  promise.resolve(server);
}

function replaceAssetPaths(html, htmlPath, projectRoot) {
  let assetPaths = findInternalAssetsFromHTML(html);
  let htmlDirectory = htmlPath.split('/').slice(0, -1).join('/')

  return assetPaths.reduce((result, assetPath) => {
    let normalizedFullAbsolutePath = path.normalize(`${htmlDirectory}/${assetPath}`);

    return result.replace(assetPath, normalizedFullAbsolutePath.replace(projectRoot, '.'));
  }, html);
}

function testRuntimeToInject(req, config) {
  return `<script>
    window.testTimeout = 0;
    setInterval(() => {
      window.testTimeout = window.testTimeout + 1000;
    }, 1000);

    (function() {
      function setupWebsocket() {
        window.socket = new WebSocket('ws://localhost:${req.socket.localPort}');
      }

      function trySetupWebsocket() {
        try {
          setupWebsocket();
        } catch(error) {
          console.log(error);
          window.setTimeout(() => trySetupWebsocket(), 10);
        }
      }

      trySetupWebsocket();
    })();

    {{allTestCode}}

    function setupQUnit() {
      if (!window.socket || !window.QUnit || !window.QUnit.moduleStart) {
        return window.setTimeout(() => setupQUnit(), 10);
      }

      window.QUNIT_RESULT = { totalTests: 0, finishedTests: 0, currentTest: '' };
      window.QUnit.moduleStart((details) => { // NOTE: might be useful in future for hanged module tracking
        window.socket.send(JSON.stringify({ event: 'moduleStart', details: details }));
      });

      window.QUnit.on('testStart', (details) => {
        window.QUNIT_RESULT.totalTests++;
        window.QUNIT_RESULT.currentTest = details.fullName.join(' | ');
      });
      window.QUnit.on('testEnd', (details) => { // NOTE: https://github.com/qunitjs/qunit/blob/master/src/html-reporter/diff.js
        window.QUNIT_RESULT.finishedTests++;
        window.QUNIT_RESULT.currentTest = null;
        window.testTimeout = 0;
        window.socket.send(JSON.stringify({ event: 'testEnd', details: details }));
      });

      window.QUnit.done((details) => {
        window.socket.send(JSON.stringify({ event: 'done', details: details }));
        window.setTimeout(() => {
          window.testTimeout = ${config.timeout};
        }, 75);
      });

      window.setTimeout(() => window.QUnit.start(), 10);
    }

    setupQUnit();
  </script>`;
}
