import kleur from 'kleur';
import path from 'path';
import http from 'http';
import express from 'nanoexpress';
import fs from 'fs/promises';
import findInternalAssetsFromHTML from '../utils/find-internal-assets-from-html.js';
import TAPDisplayTestResult from '../tap/display-test-result.js';
import staticServe from '@nanoexpress/middleware-static-serve';

export default async function setupWebServer(config = {
  port: 1234, debug: false, watch: false, timeout: 10000
}, cachedContent) {
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


  app.ws('/', (req, res) => {
    res.on('connection', (ws) => {
      ws.subscribe('refresh');
      ws.subscribe('abort');

      res.on('message', (message) => {
        const { event, details, abort } = JSON.parse(message);

        if (event === "connection") {
          console.log('TAP version 13');
        } else if ((event === 'testEnd') && !abort) {
          if (details.status === 'failed') {
            config.lastFailedTestFiles = config.lastRanTestFiles;
          }

          TAPDisplayTestResult(config.COUNTER, details)
        }
      });
    });
  });

  app.get('/', async (req, res) => {
    let TEST_RUNTIME_TO_INJECT = testRuntimeToInject(app.config.port, config);
    let htmlContent = escapeAndInjectTestsToHTML(
      replaceAssetPaths(cachedContent.mainHTML.html, cachedContent.mainHTML.filePath, config.projectRoot),
      TEST_RUNTIME_TO_INJECT,
      cachedContent.allTestCode
    );

    res.send(htmlContent);

    return await fs.writeFile(`${config.projectRoot}/${config.output}/index.html`, htmlContent);
  });

  app.get('/qunitx.html', async (req, res) => {
    let TEST_RUNTIME_TO_INJECT = testRuntimeToInject(app.config.port, config);
    let htmlContent = escapeAndInjectTestsToHTML(
      replaceAssetPaths(cachedContent.mainHTML.html, cachedContent.mainHTML.filePath, config.projectRoot),
      TEST_RUNTIME_TO_INJECT,
      cachedContent.filteredTestCode
    );

    res.send(htmlContent);

    return await fs.writeFile(`${config.projectRoot}/${config.output}/qunitx.html`, htmlContent);
  });

  app.use(staticServe(path.join(config.projectRoot, config.output), {
    mode: 'live',
    lastModified: true,
    index: false
  }));

  app.get('/*', async (req, res) => {
    if (config.debug) {
      console.log(`# [HTTPServer] ${req.method} ${req.path}`);
    }

    let dynamicHTML = cachedContent.dynamicContentHTMLs[`${config.projectRoot}${req.path}`];
    if (dynamicHTML) {
      let TEST_RUNTIME_TO_INJECT = testRuntimeToInject(app.config.port, config);
      let htmlContent = escapeAndInjectTestsToHTML(
        dynamicHTML,
        TEST_RUNTIME_TO_INJECT,
        cachedContent.allTestCode
      );

      res.send(htmlContent);

      return await fs.writeFile(`${config.projectRoot}/${config.output}${req.path}`, htmlContent);
    }

    return res.send({
      code: 404,
      message: 'Not found'
    })
  });

  return app;
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
        window.socket.addEventListener('message', function(messageEvent) {
          if (!window.IS_PUPPETEER && messageEvent.data === 'refresh') {
            window.location.reload(true);
          } else if (window.IS_PUPPETEER && messageEvent.data === 'abort') {
            window.abortQUnit = true;
            window.QUnit.config.queue.length = 0;
            window.socket.send(JSON.stringify({ event: 'abort' }))
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
      window.QUNIT_RESULT = { totalTests: 0, finishedTests: 0, currentTest: '' };

      if (!window.socket ) {
        return window.setTimeout(() => setupQUnit(), 10);
      } else if (!window.QUnit || !window.QUnit.moduleStart || window.QUnit.config.queue === 0) {
        if (socket.readyState == 0) {
          return window.setTimeout(() => setupQUnit(), 10);
        }

        window.testTimeout = ${config.timeout};
        return;
      }

      window.QUnit.begin(() => { // NOTE: might be useful in future for hanged module tracking
        if (window.IS_PUPPETEER) {
          window.socket.send(JSON.stringify({ event: 'connection' }));
        }
      });
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
          window.socket.send(JSON.stringify({ event: 'testEnd', details: details, abort: window.abortQUnit }));

          if (${config.failFast} && details.status === 'failed') {
            window.QUnit.config.queue.length = 0;
          }
        }
      });
      window.QUnit.done((details) => {
        if (window.IS_PUPPETEER) {
          window.socket.send(JSON.stringify({ event: 'done', details: details, abort: window.abortQUnit }));
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

function escapeAndInjectTestsToHTML(html, testRuntimeCode, testContentCode) {
  return html
    .replace('{{content}}',
      testRuntimeCode
        .replace('{{allTestCode}}', testContentCode)
        .replace('</script>', '<\/script>') // NOTE: remove this when simple-html-tokenizer PR gets merged
    );
}
