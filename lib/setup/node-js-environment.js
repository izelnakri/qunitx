import QUnit from '../../index.js';
import yaml from 'js-yaml'
import clonedeep from 'lodash.clonedeep';
import indentString from 'indent-string';
import timeCounter  from '../utils/time-counter.js';
import TAPDisplayFinalResult from '../tap/display-final-result.js';
import TAPDisplayTestResult from '../tap/display-test-result.js';

export default function setupNodeJSEnvironment(config) {
  global.window = global;
  window.QUnit = QUnit;
  window.QUnit.config.autostart = false;
  window.QUnit.config.testTimeout = global.testTimeout;

  let TIME_COUNTER = timeCounter();

  window.QUnit.on('testEnd', (details) => {
    TAPDisplayTestResult(config.COUNTER, details)
  });
  window.QUnit.done((details) => {
    console.log('done call');
    console.log(details);
    window.QUNIT_RESULT = Object.assign(details, {
      timeTaken: TIME_COUNTER.stop()
    });
    TAPDisplayFinalResult(config.COUNTER, details.timeTaken);

    if (!config.watch) {
      process.exit(config.COUNTER.failCount > 0 ? 1 : 0);
    }
  });

  process.on('uncaughtException', (err) => console.error(err));
  // global.oldQUnitConfig = global.oldQUnitConfig || Map(window.QUnit.config).toJS();
  // window.QUnit.config = Map(global.oldQUnitConfig).toJS();

  return window.QUnit;
}
