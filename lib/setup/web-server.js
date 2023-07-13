import fs from 'node:fs';
import path from 'node:path';
import findInternalAssetsFromHTML from '../utils/find-internal-assets-from-html.js';
import TAPDisplayTestResult from '../tap/display-test-result.js';
import pathExists from '../utils/path-exists.js';
import HTTPServer, { MIME_TYPES } from '../servers/http.js';

const fsPromise = fs.promises;

export default async function setupWebServer(config = {
  port: 1234, debug: false, watch: false, timeout: 10000
}, cachedContent) {
  let STATIC_FILES_PATH = path.join(config.projectRoot, config.output);
  let server = new HTTPServer();

  server.wss.on('connection', function connection(socket) {
    socket.on('message', function message(data) {
      const { event, details, abort } = JSON.parse(data);

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

  server.get('/', async (req, res) => {
    let TEST_RUNTIME_TO_INJECT = testRuntimeToInject(config.port, config);
    let htmlContent = escapeAndInjectTestsToHTML(
      replaceAssetPaths(cachedContent.mainHTML.html, cachedContent.mainHTML.filePath, config.projectRoot),
      TEST_RUNTIME_TO_INJECT,
      cachedContent.allTestCode
    );

    res.write(htmlContent);
    res.end();

    return await fsPromise.writeFile(`${config.projectRoot}/${config.output}/index.html`, htmlContent);
  });

  server.get('/qunitx.html', async (req, res) => {
    let TEST_RUNTIME_TO_INJECT = testRuntimeToInject(config.port, config);
    let htmlContent = escapeAndInjectTestsToHTML(
      replaceAssetPaths(cachedContent.mainHTML.html, cachedContent.mainHTML.filePath, config.projectRoot),
      TEST_RUNTIME_TO_INJECT,
      cachedContent.filteredTestCode
    );

    res.write(htmlContent);
    res.end();

    return await fsPromise.writeFile(`${config.projectRoot}/${config.output}/qunitx.html`, htmlContent);
  });

  server.get('/*', async (req, res) => {
    let possibleDynamicHTML = cachedContent.dynamicContentHTMLs[`${config.projectRoot}${req.path}`];
    if (possibleDynamicHTML) {
      let TEST_RUNTIME_TO_INJECT = testRuntimeToInject(config.port, config);
      let htmlContent = escapeAndInjectTestsToHTML(
        possibleDynamicHTML,
        TEST_RUNTIME_TO_INJECT,
        cachedContent.allTestCode
      );

      res.write(htmlContent);
      res.end();

      return await fsPromise.writeFile(`${config.projectRoot}/${config.output}${req.path}`, htmlContent);
    }

    let url = req.url;
    let requestStartedAt = new Date();
    let filePath = (url.endsWith("/") ? [STATIC_FILES_PATH, url, "index.html"] : [STATIC_FILES_PATH, url]).join('');
    let statusCode = await pathExists(filePath) ? 200 : 404;

    res.writeHead(statusCode, {
      "Content-Type": req.headers.accept?.includes('text/html')
        ? MIME_TYPES.html
        : MIME_TYPES[path.extname(filePath).substring(1).toLowerCase()] || MIME_TYPES.html
    });

    if (statusCode === 404) {
      res.end();
    } else {
      fs.createReadStream(filePath)
        .pipe(res);
    }

    console.log(`# [HTTPServer] GET ${url} ${statusCode} - ${new Date() - requestStartedAt}ms`);
  });

  return server;
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

    function getCircularReplacer() {
      const ancestors = [];
      return function (key, value) {
        if (typeof value !== "object" || value === null) {
          return value;
        }
        while (ancestors.length > 0 && ancestors.at(-1) !== this) {
          ancestors.pop();
        }
        if (ancestors.includes(value)) {
          return "[Circular]";
        }
        ancestors.push(value);
        return value;
      };
    }

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
          window.socket.send(JSON.stringify({ event: 'moduleStart', details: details }, getCircularReplacer()));
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
          window.socket.send(JSON.stringify({ event: 'testEnd', details: details, abort: window.abortQUnit }, getCircularReplacer()));

          if (${config.failFast} && details.status === 'failed') {
            window.QUnit.config.queue.length = 0;
          }
        }
      });
      window.QUnit.done((details) => {
        if (window.IS_PUPPETEER) {
          window.setTimeout(() => {
            window.socket.send(JSON.stringify({ event: 'done', details: details, abort: window.abortQUnit }, getCircularReplacer()))
          }, 50);
        }
        window.setTimeout(() => {
          window.testTimeout = ${config.timeout};
        }, 75);
      });

      if ([1, 3].includes(window.socket.readyState)) {
        return window.setTimeout(() => window.QUnit.start(), 25);
      } else {
        let connectionTrialCount = 0;
        let connectionInterval = window.setInterval(() => {
          if ([1, 3].includes(window.socket.readyState) || connectionTrialCount > 25) {
            window.clearInterval(connectionInterval);

            return window.setTimeout(() => window.QUnit.start(), 25);
          }

          connectionTrialCount = connectionTrialCount + 1;
        }, 10);
      }
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
