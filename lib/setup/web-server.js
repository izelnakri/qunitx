import http from 'http';
import fs from 'fs/promises';

// TODO: probably rewrite asset paths & expose needed assets under a middleware

export default async function setupWebServer(config = {
  httpPort: 1234, debug: false, watch: false, timeout: 10000
}, codeInputs = { QUnitCSS, allTestCode, mainHTML, staticHTMLs, dynamicContentHTMLs }, promise) {
  let { QUnitCSS, allTestCode, mainHTML, staticHTMLs, dynamicContentHTMLs} = codeInputs;

  // TODO: occasionally wrong content is served!!
  const server = http.createServer((req, res) => {
    let TEST_RUNTIME_TO_INJECT = `<script>
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

    ${allTestCode}

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

    if (req.url === '../node_modules/qunit/qunit/qunit.css') {
      res.writeHead(200, { 'Content-Type': 'text/css' });
      return res.end(QUnitCSS, 'utf-8');
    }

    let staticHTML = staticHTMLs[req.url];
    if (staticHTML) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(staticHTML, 'utf-8');
    }

    let dynamicHTML = dynamicContentHTMLs[req.url];
    if (dynamicHTML) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(dynamicHTML.replace('{{content}}', TEST_RUNTIME_TO_INJECT), 'utf-8');
    }

    // TODO: implement express static middleware

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(mainHTML.html.replace('{{content}}', TEST_RUNTIME_TO_INJECT), 'utf-8');
  });

  promise.resolve({ server, codeInputs });
}
