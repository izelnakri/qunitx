import jsdom from "jsdom";
import QUnit from '../../index.js';
import timeCounter  from '../utils/time-counter.js';
import runUserModule from '../utils/run-user-module.js';
import TAPDisplayFinalResult from '../tap/display-final-result.js';
import TAPDisplayTestResult from '../tap/display-test-result.js';

function setupDOM() {
  const { JSDOM } = jsdom;
  const dom = new JSDOM("<p>Hello</p>", {
    url: "http://localhost",
  });

  global.window = dom.window;
  global.document = window.document;
  global.FormData = dom.window.FormData;
  // @ts-ignore
  global.self = global; // NOTE: super important for pretender
  self.XMLHttpRequest = dom.window.XMLHttpRequest; // pretender reference
  global.location = global.window.location; // removes href of undefined on jquery
}

export default async function setupNodeJSEnvironment(config) {
  setupDOM(); // NOTE: This is important for pretender & browser APIs
  // global.window = global;

  window.QUnit = QUnit;
  window.QUnit.config.autostart = false;
  window.QUnit.config.testTimeout = global.testTimeout;

  let TIME_COUNTER;
  window.QUnit.begin((details) => {
    TIME_COUNTER = timeCounter();
  });
  window.QUnit.on('testEnd', (details) => {
    if (config.aborted) {
      config.aborted = false;
    }

    TAPDisplayTestResult(config.COUNTER, details);

    if (details.status === 'failed') {
      config.lastFailedTestFiles = config.lastRanTestFiles;


      if (config.failFast) {
        abortQUnit();
      }
    }
  });
  window.QUnit.done(async (details) => {
    window.QUNIT_RESULT = Object.assign(details, {
      timeTaken: TIME_COUNTER.stop()
    });
    TAPDisplayFinalResult(config.COUNTER, details.timeTaken);

    if (config.after) {
      await runUserModule(`${process.cwd()}/${config.after}`, config.COUNTER, 'after');
    }

    if (!config.watch) {
      process.exit(config.COUNTER.failCount > 0 ? 1 : 0);
    }
  });

  process.on('unhandledRejection', (err) => console.error(err));
  process.on('uncaughtException', (err) => console.error(err));

  return window.QUnit;
}

function abortQUnit() {
  window.QUnit.config.queue.length = 0;
}
