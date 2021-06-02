import QUnit from '../../index.js';
import timeCounter  from '../utils/time-counter.js';
import runUserModule from '../utils/run-user-module.js';
import TAPDisplayFinalResult from '../tap/display-final-result.js';
import TAPDisplayTestResult from '../tap/display-test-result.js';

export default async function setupNodeJSEnvironment(config) {
  global.window = global;

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
