import Puppeteer from 'puppeteer';
import setupWebServer from './web-server.js';
import setupWebsocketServer from './websocket-server.js';
import bindServerToPort from './bind-server-to-port.js';

export default async function setupBrowser(COUNTER, config = {
  httpPort: 1234, debug: false, watch: false, timeout: 10000
}, codeToInject) {
  let server = await new Promise((resolve, reject) => setupWebServer(config, codeToInject, { resolve, reject }));
  let WebSocketServer = await new Promise((resolve, reject) => setupWebsocketServer(server, { resolve, reject }));

  server = await new Promise((resolve, reject) => bindServerToPort(server, WebSocketServer, COUNTER, config, { resolve, reject }));

  const browser = await Puppeteer.launch({
    executablePath: process.env.CHROME_BIN || null,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--remote-debugging-port=0', '--window-size=1440,900']
  });
  const page = await browser.newPage();

  page.on('console', async (msg) => {
    if (config.debug) {
      const args = await Promise.all(msg.args().map((arg) => turnToObjects(arg)));

      console.log(...args);
    }
  });
  page.on('error', (msg) => {
    try {
      throw error;
    } catch (e) {
      console.error(e, e.stack);
      console.log(e, e.stack);
    }
  });
  page.on('pageerror', async (error) => {
    try {
      throw error;
    } catch (e) {
      console.log(e.toString());
      console.error(e.toString());
    }
  });

  let QUNIT_RESULT;
  try {
    await page.goto(`http://localhost:${server.address().port}/index.html`, { timeout: 0 });
    await page.waitForFunction(`window.testTimeout >= ${config.timeout}`, { timeout: 0 });

    QUNIT_RESULT = await page.evaluate(() => window.QUNIT_RESULT);
  } catch(error) {
    console.log(error);
    console.error(error);
  }

  if (!QUNIT_RESULT || QUNIT_RESULT.totalTests === 0) {
    console.log('BROWSER: runtime error thrown during executing tests');
    console.error('BROWSER: runtime error thrown during executing tests');
    await new Promise((resolve, reject) => setTimeout(() => resolve(process.exit(1)), 100));
  } else if (QUNIT_RESULT.totalTests > QUNIT_RESULT.finishedTests) {
    console.log(`BROWSER: TEST TIMED OUT: ${QUNIT_RESULT.currentTest}`);
    console.error(`BROWSER: TEST TIMED OUT: ${QUNIT_RESULT.currentTest}`);
    await new Promise((resolve, reject) => setTimeout(() => resolve(process.exit(1)), 100));
  }

  return { browser, server, WebSocketServer };
}

function turnToObjects(jsHandle) {
  return jsHandle.jsonValue();
}

// function turnMStoSecond(timeInMS) {
//   return (timeInMS / 1000).toFixed(2);
// }
