import http from 'http';
import fs from 'fs';
import Puppeteer from 'puppeteer';

const defaults = { port: 4200, debug: false, socketPort: 65512, testTimeout: 5000 };

export default async function(options = { port: 4200, debug: false, socketPort: 65511 }) {
  let boilerplateQunit = fs.readFileSync(`${process.cwd()}/test.js`).toString();
  const OPTIONS = Object.assign({}, defaults, options);
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>emberx Tests</title>
    <style>
      #ember-testing-container {
        position:relative;
        background:#fff;
        bottom:0;
        right:0;
        width:640px;
        height:384px;
        overflow:auto;
        z-index:98;
        border:1px solid #ccc;
        margin:0 auto;
        transform:translateZ(0)
      }

      #ember-testing-container.full-screen {
        width:100%;
        height:100%;
        overflow:auto;
        z-index:98;
        border:none
      }

      #ember-testing {
        width:200%;
        height:200%;
        transform:scale(0.5);
        transform-origin:top left
      }

      .full-screen #ember-testing{
        position:absolute;
        width:100%;
        height:100%;
        transform:scale(1)
      }
    </style>
  </head>
  <body>
    <div id="qunit"></div>
    <div id="qunit-fixture"></div>

    <script>
      window.MBER_TEST_TIME_COUNTER = (function() {
        const startTime = new Date();

        return {
          start: startTime,
          stop: () => +(new Date()) - (+startTime)
        };
      })();

      window.testTimeout = 0;
      setInterval(() => {
        window.testTimeout = window.testTimeout + 1000;
      }, 1000);
      window.socket = new WebSocket('ws://localhost:${OPTIONS.socketPort}');

      ${boilerplateQunit}

      window.QUnit.moduleStart((details) => {
        window.socket.send(JSON.stringify({ event: 'moduleStart', details: details }));
      });

      window.QUnit.on('testEnd', (details) => { // NOTE: https://github.com/qunitjs/qunit/blob/master/src/html-reporter/diff.js
        window.socket.send(JSON.stringify({ event: 'testEnd', details: details }));
      });

      window.QUnit.done((details) => {
        window.testTimeout = ${OPTIONS.testTimeout};
        window.QUNIT_RESULT = Object.assign(details, {
          timeTaken: window.MBER_TEST_TIME_COUNTER.stop()
        });
      });
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
  await page.goto(`http://localhost:${OPTIONS.port}/index.html`);
  await page.waitForFunction(`window.testTimeout > ${OPTIONS.testTimeout}`, { timeout: 0 });

  return { browser, server };
}

function turnToObjects(jsHandle) {
  return jsHandle.jsonValue();
}

// function turnMStoSecond(timeInMS) {
//   return (timeInMS / 1000).toFixed(2);
// }
