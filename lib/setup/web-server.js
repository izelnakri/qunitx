import kleur from 'kleur';
import path from 'path';
import http from 'http';
import express from 'nanoexpress';
import fs from 'fs/promises';
import findInternalAssetsFromHTML from '../utils/find-internal-assets-from-html.js';
import TAPDisplayTestResult from '../tap/display-test-result.js';
import staticServe from '@nanoexpress/middleware-static-serve';

export default async function setupWebServer(config = {
  httpPort: 1234, debug: false, watch: false, timeout: 10000
}, cachedContent, promise) {
  let ServerConsole = ['log', 'error', 'done', 'warn', 'info'].reduce((result, type) => {
    return Object.assign(result, {
      [type]: (...messages) => {
        console.log(`# HTTPServer[${type}] :`, ...messages);
      }
    });
  }, {});
  ServerConsole.debug = (...messages) => {
    if (config.debug) {
      console.log('#', kleur.blue(`HTTPServer`), ...messages);
    }
  };

  let app = express({ console: ServerConsole });

  app.use(staticServe(path.join(config.projectRoot, config.output), {
    mode: 'live',
    lastModified: true,
    index: false
  }));

  app.ws('/', (req, res) => {
    res.on('connection', (ws) => {
      ws.subscribe('refresh');

      console.log('TAP version 13');

      res.on('message', (message) => {
        const { event, details } = JSON.parse(message);

        if (event === 'testEnd') {
          TAPDisplayTestResult(config.COUNTER, details)
        }
      });
    });
  });

  app.get('/', async (req, res) => {
    let TEST_RUNTIME_TO_INJECT = testRuntimeToInject(app.config.port, config);
    let htmlContent = replaceAssetPaths(
      cachedContent.mainHTML.html,
      cachedContent.mainHTML.filePath,
      config.projectRoot
    ).replace('{{content}}', TEST_RUNTIME_TO_INJECT.replace('{{allTestCode}}', cachedContent.allTestCode))

    res.send(htmlContent);

    return await fs.writeFile(`${config.projectRoot}/${config.output}/index.html`, htmlContent);
  });


  app.get('/*', async (req, res) => {
    if (config.debug) {
      console.log(`# [HTTPServer] ${req.method} ${req.path}`);
    }

    let dynamicHTML = cachedContent.dynamicContentHTMLs[`${config.projectRoot}${req.path}`];
    if (dynamicHTML) {
      let TEST_RUNTIME_TO_INJECT = testRuntimeToInject(app.config.port, config);
      let htmlContent = dynamicHTML
        .replace('{{content}}', TEST_RUNTIME_TO_INJECT.replace('{{allTestCode}}', cachedContent.allTestCode));

      res.send(htmlContent);

      let targetPath = `${config.projectRoot}/${config.output}${req.path}`;

      await fs.mkdir(targetPath.split('/').slice(0, -1).join('/'), { recursive: true }); // NOTE: this can be done earlier
      return await fs.writeFile(targetPath, htmlContent);
    }

    return res.send({
      code: 404,
      message: 'Not found'
    })
  });

  promise.resolve(app);
}

function replaceAssetPaths(html, htmlPath, projectRoot) {
  let assetPaths = findInternalAssetsFromHTML(html);
  let htmlDirectory = htmlPath.split('/').slice(0, -1).join('/')

  return assetPaths.reduce((result, assetPath) => {
    let normalizedFullAbsolutePath = path.normalize(`${htmlDirectory}/${assetPath}`);

    return result.replace(assetPath, normalizedFullAbsolutePath.replace(projectRoot, '.'));
  }, html);
}

function testRuntimeToInject(port, config) {
  return `<script>
    window.testTimeout = 0;
    setInterval(() => {
      window.testTimeout = window.testTimeout + 1000;
    }, 1000);

    (function() {
      function setupWebsocket() {
        window.socket = new WebSocket('ws://localhost:${port}');
        window.socket.addEventListener('message', function(event) {
          if (!window.IS_PUPPETEER) {
            window.location.reload(true);
          }
        });
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
        if (window.IS_PUPPETEER) {
          window.socket.send(JSON.stringify({ event: 'moduleStart', details: details }));
        }
      });

      window.QUnit.on('testStart', (details) => {
        window.QUNIT_RESULT.totalTests++;
        window.QUNIT_RESULT.currentTest = details.fullName.join(' | ');
      });
      window.QUnit.on('testEnd', (details) => { // NOTE: https://github.com/qunitjs/qunit/blob/master/src/html-reporter/diff.js
        window.testTimeout = 0;
        window.QUNIT_RESULT.finishedTests++;
        window.QUNIT_RESULT.currentTest = null;
        if (window.IS_PUPPETEER) {
          window.socket.send(JSON.stringify({ event: 'testEnd', details: details }));
        }
      });

      window.QUnit.done((details) => {
        if (window.IS_PUPPETEER) {
          window.socket.send(JSON.stringify({ event: 'done', details: details }));
        }
        window.setTimeout(() => {
          window.testTimeout = ${config.timeout};
        }, 75);
      });

      window.setTimeout(() => window.QUnit.start(), 10);
    }

    setupQUnit();
  </script>`;
}
