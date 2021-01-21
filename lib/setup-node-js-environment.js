import chalk from 'chalk';
import QUnit from 'qunit';

window.QUnit = QUnit;
window.QUNIX_TEST_TIME_COUNTER = (function() { // NOTE: might be needed for failFast option timeTaken calculation
  const startTime = new Date();

  return {
    start: startTime,
    stop: () => +(new Date()) - (+startTime)
  };
})();

window.QUnit.moduleStart((details) => {
  console.log('[', details.name, ']');
});

window.QUnit.testDone((details) => {
  console.log(getTestStatusCode(details), details.module, details.name);
});

window.QUnit.done((details) => {
  console.log('DONE DETAILS');
  console.log(details);
  window.QUNIT_RESULT = Object.assign(details, {
    timeTaken: window.QUNIX_TEST_TIME_COUNTER.stop()
  });
  console.log(details.timeTaken); // runtime
});

export default window.QUnit;

function getTestStatusCode(details) {
  if (details.failed > 0) {
    return chalk.red('NOT OK -');
  } else if (details.skipped) {
    return chalk.blue('SKIPPED -');
  } else if (details.todo) {
    return chalk.yellow('TODO -');
  } else if (details.passed > 0) {
    return chalk.green('OK -');
  }
}
