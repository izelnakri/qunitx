import http from 'http';
import fs from 'fs';
import Puppeteer from 'puppeteer';

const defaults = { port: 4200, debug: false, socketPort: 65511, testTimeout: 10000 };

export default async function(options = { port: 4200, debug: false, socketPort: 65511 }) {
  // TODO: make these async
  let boilerplateQunit = fs.readFileSync(`${process.cwd()}/test.js`).toString();
  let QUnitCSS = fs.readFileSync(`${process.cwd()}/node_modules/qunit/qunit/qunit.css`).toString();
  // TODO: make these async end

  const OPTIONS = Object.assign({}, defaults, options);
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
      window.socket = new WebSocket('ws://localhost:${OPTIONS.socketPort}');

      ${boilerplateQunit}

      window.QUnit.moduleStart((details) => { // NOTE: might be useful in future for hanged module tracking
        window.socket.send(JSON.stringify({ event: 'moduleStart', details: details }));
      });

      window.QUnit.on('testEnd', (details) => { // NOTE: https://github.com/qunitjs/qunit/blob/master/src/html-reporter/diff.js
        window.socket.send(JSON.stringify({ event: 'testEnd', details: details }));
      });

      window.QUnit.done((details) => {
        window.socket.send(JSON.stringify({ event: 'done', details: details }));
        window.testTimeout = ${OPTIONS.testTimeout};
      });

      window.setTimeout(() => window.QUnit.start(), 10);
    </script>
  </body>
</html>`, 'utf-8');
  });
  await new Promise((resolve, reject) => {
    server.listen(OPTIONS.port, () => resolve(true));
  });
  const browser = await Puppeteer.launch({
    executablePath: process.env.CHROME_BIN || null,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--remote-debugging-port=0', '--window-size=1440,900']
  });
  const page = await browser.newPage();

  page.on('console', async (msg) => {
    if (OPTIONS.debug) {
      const args = await Promise.all(msg.args().map((arg) => turnToObjects(arg)));

      console.log(...args);
    }
  });

  await page.goto(`http://localhost:${OPTIONS.port}/index.html`, { timeout: 0 });
  await page.waitForFunction(`window.testTimeout >= ${OPTIONS.testTimeout}`, { timeout: 0 });

  return { browser, server };
}

function turnToObjects(jsHandle) {
  return jsHandle.jsonValue();
}

// function turnMStoSecond(timeInMS) {
//   return (timeInMS / 1000).toFixed(2);
// }

