import chalk from 'ansi-colors';
import Puppeteer from 'puppeteer';
import WebSocket from 'ws';
import Console from '../utils/console.js';

const defaults = { port: 4200, debug: false, socketPort: 65511 };

export default async function(options = { port: 4200, debug: false, socketPort: 65511 }) {
  const OPTIONS = Object.assign({}, defaults, options);
  const WebSocketServer = new WebSocket.Server({ port: OPTIONS.socketPort });

  WebSocketServer.on('connection', (webSocket) => {
    if (!OPTIONS.debug) {
      webSocket.on('message', (message) => {
        const { event, details } = JSON.parse(message);

        if (event === 'testDone') {
          if (details.failed > 0) {
            console.log(
              chalk.red('✘'),
              details.name,
              chalk.gray(`(${turnMStoSecond(details.runtime)}s)`)
            );
            details.assertions.forEach((assertion, index) => {
              if (assertion.result === false) {
                console.log(
                  chalk.red('Assertion #' + (index + 1), ':'),
                  assertion.message || 'This assertion fails'
                );
              }
            });
            console.log(chalk.yellow('SOURCE:'), details.source);
            Console.error('THERE IS A FAILED TEST!');

            return process.exit(1);
          } else if (details.skipped) {
            console.log(chalk.yellow('SKIP:'), details.name);
          } else if (details.todo) {
            console.log(chalk.blue('TODO:'), details.name);
          } else if (details.passed > 0) {
            console.log(
              chalk.green('✔'),
              details.name,
              chalk.gray(`(${turnMStoSecond(details.runtime)}s)`)
            );
          }
        } else if (event === 'moduleStart') {
          console.log('');
          console.log(`${details.name}:`);
        }
      });
    }
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

  await page.goto(`http://localhost:${OPTIONS.port}/tests?hidepassed`, { timeout: 0 });
  await page.addScriptTag({
    content: `
      window.MBER_TEST_TIME_COUNTER = (function() {
        const startTime = new Date();

        return {
          start: startTime,
          stop: () => +(new Date()) - (+startTime)
        };
      })();

      window.QUnit.moduleStart((details) => {
        console.log('[', details.name, ']');
        window.socket.send(JSON.stringify({ event: 'moduleStart', details: details }));
      });

      window.QUnit.testDone((details) => {
        console.log(getTestStatusCode(details), \`\${details.module} |\`, details.name);
        window.socket.send(JSON.stringify({ event: 'testDone', details: details }));
      });

      window.QUnit.done((details) => {
        window.QUNIT_RESULT = Object.assign(details, {
          timeTaken: window.MBER_TEST_TIME_COUNTER.stop()
        });
      });

      function getTestStatusCode(details) {
        if (details.failed > 0) {
          return 'NOT OK -';
        } else if (details.skipped) {
          return 'SKIPPED -';
        } else if (details.todo) {
          return 'TODO -';
        } else if (details.passed > 0) {
          return 'OK -';
        }
      }`
  });
  await page.waitForFunction('window.QUNIT_RESULT', { timeout: 0 });

  const QUNIT_RESULT = await page.evaluate(() => window.QUNIT_RESULT);

  await browser.close();

  if (QUNIT_RESULT.failed > 0) {
    Console.error('THERE IS A FAILED TEST!');

    return process.exit(1);
  }

  Console.log(chalk.green(`ALL TESTS PASS in ${turnMStoSecond(QUNIT_RESULT.timeTaken)} seconds!`));
  process.exit();
}

function turnToObjects(jsHandle) {
  return jsHandle.jsonValue();
}

function turnMStoSecond(timeInMS) {
  return (timeInMS / 1000).toFixed(2);
}
