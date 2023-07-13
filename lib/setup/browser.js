import Puppeteer from 'puppeteer';
import setupWebServer from './web-server.js';
import bindServerToPort from './bind-server-to-port.js';

export default async function setupBrowser(config = {
  port: 1234, debug: false, watch: false, timeout: 10000
}, cachedContent) {
  let [server, browser] = await Promise.all([
    setupWebServer(config, cachedContent),
    Puppeteer.launch({
      debugger: config.debug || false,
      args: ['--no-sandbox', '--disable-gpu', '--remote-debugging-port=0', '--window-size=1440,900'],
      executablePath: process.env.CHROME_BIN || null,
      headless: 'new',
    }),
  ]);
  let [page, _] = await Promise.all([
    browser.newPage(),
    bindServerToPort(server, config)
  ]);

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

  return { server, browser, page };
}

function turnToObjects(jsHandle) {
  return jsHandle.jsonValue();
}

// function turnMStoSecond(timeInMS) {
//   return (timeInMS / 1000).toFixed(2);
// }
