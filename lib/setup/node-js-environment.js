import chalk from 'chalk';
import QUnit from '../../index.js';
import yaml from 'js-yaml'
import indentString from 'indent-string';
import TAPDisplayFinalResult from '../tap/display-final-result.js';
import TAPDisplayTestResult from '../tap/display-test-result.js';

let COUNTER = { testCount: 0, failCount: 0, skipCount: 0, passCount: 0 };

global.window = global;
window.QUnit = QUnit;
window.QUNIX_TEST_TIME_COUNTER = (function() { // NOTE: might be needed for failFast option timeTaken calculation
  const startTime = new Date();

  return {
    start: startTime,
    stop: () => +(new Date()) - (+startTime)
  };
})();


window.QUnit.on('testEnd', (details) => TAPDisplayTestResult(COUNTER, details));
window.QUnit.done((details) => {
  window.QUNIT_RESULT = Object.assign(details, {
    timeTaken: window.QUNIX_TEST_TIME_COUNTER.stop()
  });
  TAPDisplayFinalResult(COUNTER, details.timeTaken);
});

export default window.QUnit;
