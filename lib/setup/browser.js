import fs from 'fs/promises';
import kleur from 'kleur';
import Puppeteer from 'puppeteer';
import setupWebServer from './web-server.js';
import bindServerToPort from './bind-server-to-port.js';

export default async function setupBrowser(config = {
  httpPort: 1234, debug: false, watch: false, timeout: 10000
}, cachedContent = { allTestCode, mainHTML, staticHTMLs, dynamicContentHTMLs }, connections = {}) {
  let { mainHTML, staticHTMLs, dynamicContentHTMLs } = cachedContent;
  let server = connections.server ||
    await new Promise((resolve, reject) => setupWebServer(config, cachedContent, { resolve, reject }));

  if (!connections.server) {
    connections.server = await new Promise((resolve, reject) => bindServerToPort(server, config, { resolve, reject }));
  }

  let browser = connections.browser || await Puppeteer.launch({
    executablePath: process.env.CHROME_BIN || null,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--remote-debugging-port=0', '--window-size=1440,900']
  });
  let page = connections.page || await browser.newPage();

  if (!connections.page) {
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
  }

  let arrayOfHTMLs = Object.keys(dynamicContentHTMLs);

  await Promise.all(arrayOfHTMLs.map(async (dynamicHTMLPath) => {
    let relativePath = dynamicHTMLPath.replace(config.projectRoot, '');

    console.log(`${config.projectRoot}/${config.output}/${relativePath}`);
    await fs.rm(`${config.projectRoot}/${config.output}/${relativePath}`);
  }));

  Object.keys(staticHTMLs).forEach((staticHTML) => {
    console.log('#', kleur.yellow(`WARNING: Static html file with no {{content}} detected. Therefore ignoring ${staticHTML}`));
  });

  if (arrayOfHTMLs.length === 0) {
    arrayOfHTMLs = ['/']
  }

  // TODO: Current logic would run all static and dynamic HTMLs on each file change because only dynamicHTMLs(with {{content}}) gets run
  await Promise.all(arrayOfHTMLs.map(async (htmlPath) => {
    let relativePath = htmlPath.replace(config.projectRoot, '');

    await runTestInsideHTMLFile(relativePath, server, page, config) // NOTE: we are blocking each html here on purpose
  }));

  return { browser, page, server };
}

function turnToObjects(jsHandle) {
  return jsHandle.jsonValue();
}

async function runTestInsideHTMLFile(filePath, server, page, config) {
  let QUNIT_RESULT;
  try {
    console.log('#', kleur.blue(`Running: ${filePath}`));
    await page.goto(`http://localhost:${server.config.port}${filePath}`, { timeout: 0 });
    await page.evaluate(() => {
      window.IS_PUPPETEER = true;
    });
    await page.waitForFunction(`window.testTimeout >= ${config.timeout}`, { timeout: 0 });

    QUNIT_RESULT = await page.evaluate(() => window.QUNIT_RESULT);
  } catch(error) {
    console.log(error);
    console.error(error);
  }

  if (!QUNIT_RESULT || QUNIT_RESULT.totalTests === 0) {
    console.log('BROWSER: runtime error thrown during executing tests');
    console.error('BROWSER: runtime error thrown during executing tests');

    await failOnNonWatchMode(config.watch);
  } else if (QUNIT_RESULT.totalTests > QUNIT_RESULT.finishedTests) {
    console.log(`BROWSER: TEST TIMED OUT: ${QUNIT_RESULT.currentTest}`);
    console.error(`BROWSER: TEST TIMED OUT: ${QUNIT_RESULT.currentTest}`);

    await failOnNonWatchMode(config.watch);
  }
}

async function failOnNonWatchMode(watchMode = false) {
  if (!watchMode) {
    await new Promise((resolve, reject) => setTimeout(() => resolve(process.exit(1)), 100));
  }
}
// function turnMStoSecond(timeInMS) {
//   return (timeInMS / 1000).toFixed(2);
// }
