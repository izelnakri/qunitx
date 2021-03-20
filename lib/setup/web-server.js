import http from 'http';
import fs from 'fs/promises';

export default async function setupWebServer(config = {
  httpPort: 1234, debug: false, watch: false, timeout: 10000
}, codeToInject = { QUnitCSS, allTestCode }, promise) {
  let { QUnitCSS, allTestCode } = codeToInject;

  // TODO: occasionally wrong content is served!!
  const server = http.createServer((req, res) => {
    if (req.url === '/node_modules/qunit/qunit/qunit.css') {
      res.writeHead(200, { 'Content-Type': 'text/css' });
      return res.end(QUnitCSS, 'utf-8');
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>emberx Tests</title>
    <link href="./node_modules/qunit/qunit/qunit.css" rel="stylesheet">
  </head>
  <body>
    <div id="qunit"></div>
    <div id="qunit-fixture"></div>

    <script>
      window.testTimeout = 0;
      setInterval(() => {
        window.testTimeout = window.testTimeout + 1000;
      }, 1000);
      window.socket = new WebSocket('ws://localhost:${req.socket.localPort}');

      ${allTestCode}

      function setupQUnit() {
        if (!window.QUnit || !window.QUnit.moduleStart) {
          return window.setTimeout(() => setupQUnit(), 10);
        }

        window.QUnit.moduleStart((details) => { // NOTE: might be useful in future for hanged module tracking
          window.socket.send(JSON.stringify({ event: 'moduleStart', details: details }));
        });

        window.QUnit.on('testEnd', (details) => { // NOTE: https://github.com/qunitjs/qunit/blob/master/src/html-reporter/diff.js
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
    </script>
  </body>
</html>`, 'utf-8');
  });

  promise.resolve(server);
}
