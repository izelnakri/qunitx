import chalk from 'chalk';
import QUnit from '../index.js';
import yaml from 'js-yaml'
import indentString from 'indent-string';

let testCount = 0;
let failCount = 0;
let skipCount = 0;
let passCount = 0;

global.window = global;

window.QUnit = QUnit;
window.QUNIX_TEST_TIME_COUNTER = (function() { // NOTE: might be needed for failFast option timeTaken calculation
  const startTime = new Date();

  return {
    start: startTime,
    stop: () => +(new Date()) - (+startTime)
  };
})();

// tape TAP output: ['operator', 'stack', 'at', 'expected', 'actual']
// ava TAP output: ['message', 'name', 'at', 'assertion', 'values'] // Assertion #5, message
window.QUnit.on('testEnd', (details) => { // NOTE: https://github.com/qunitjs/qunit/blob/master/src/html-reporter/diff.js
  testCount++;

  if (details.status === 'skipped') {
    skipCount++;
    console.log(`ok ${testCount}`, details.fullName.join(' | '), '# skip');
  } else if (details.status === 'todo') {
    console.log(`not ok ${testCount}`, details.fullName.join(' | '), '# skip');
  } else if (details.status === 'failed') {
    passCount++;
    console.log(`not ok ${testCount}`, details.fullName.join(' | '), `# (${details.runtime} ms)`);
    details.assertions.reduce((errorCount, assertion, index) => {
      if (!assertion.passed && assertion.todo === false) {
        errorCount++;
        let stack = assertion.stack.match(/\(.+\)/g);

        console.log('  ---');
        console.log(indentString(yaml.safeDump({
          name: `Assertion #${index + 1}`, // TODO: check what happens on runtime errors
          actual: assertion.actual || null,
          expected: assertion.expected || null,
          message: assertion.message || null,
          stack: assertion.stack || null,
          at: stack ? stack[0].replace('(file://', '').replace(')', '') : null
        }).trim(), 4));
        console.log('  ...');
      }

      return errorCount;
    }, 0);
  } else if (details.status === 'passed') {
    passCount++;
    console.log(`ok ${testCount}`, details.fullName.join(' | '), `# (${details.runtime} ms)`);
  }

});

window.QUnit.done((details) => {
  window.QUNIT_RESULT = Object.assign(details, {
    timeTaken: window.QUNIX_TEST_TIME_COUNTER.stop()
  });
  displayResults(details.timeTaken);
  // console.log(details.timeTaken); // runtime
});

export default window.QUnit;

function displayResults(timeTaken) {
  console.log('');
  console.log(`1..${testCount}`);
  console.log(`# tests ${testCount}`);
  console.log(`# pass ${passCount}`);
  console.log(`# skip ${skipCount}`);
  console.log(`# fail ${failCount}`);

  // let seconds = timeTaken > 1000 ? Math.floor(timeTaken / 1000) : 0;
  // let milliseconds = timeTaken % 100;

  console.log(`# duration ${timeTaken}`);
  console.log('');
}

// not ok 1 - t true works
//   ---
//     name: AssertionError
//     message: Error thrown in test
//     values:
//       'Error thrown in test:': |-
//         TypeError {
//           message: 't.expect is not a function',
//         }
//     at: 'test/failing-test.js:4:5'
//   ...
// not ok 2 - deepEqual true works
//   ---
//     name: AssertionError
//     assertion: deepEqual
//     values:
//       'Difference:': |2-
//           {
//         -   firstName: 'Izel',
//         +   firstName: 'Isaac',
//             lastName: 'Nakri',
//           }
//     at: 'test/failing-test.js:34:5'
//   ...
// not ok 3 - async test finishes
//   ---
//     name: AssertionError
//     message: Rejected promise returned by test
//     values:
//       'Rejected promise returned by test. Reason:': |-
//         TypeError {
//           message: 't.expect is not a function',
//         }
//     at: 'test/failing-test.js:11:5'
//   ...


// ---
//   operator: error
//   stack: |-
//     Error: lol
//         at Test.<anonymous> (/home/izelnakri/ava-test/tape.js:18:9)
// ...

//   ---
//     operator: ok
//     expected: true
//     actual:   false
//     at: Test.<anonymous> (/home/izelnakri/ava-test/tape.js:19:9)
//     stack: |-
//       Error: should be truthy
//           at Test.assert [as _assert] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:269:54)
//           at Test.bound [as _assert] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:90:32)
//           at Test.assert (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:388:10)
//           at Test.bound [as true] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:90:32)
//           at Test.<anonymous> (/home/izelnakri/ava-test/tape.js:19:9)
//   ...
// ok 5 should be strictly equal
// ok 6 should be strictly equal
// after wait
// not ok 7 should be strictly equal
//   ---
//     operator: equal
//     expected: true
//     actual:   false
//     at: Test.<anonymous> (/home/izelnakri/ava-test/tape.js:25:5)
//     stack: |-
//       Error: should be strictly equal
//           at Test.assert [as _assert] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:269:54)
//           at Test.bound [as _assert] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:90:32)
//           at Test.strictEqual (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:433:10)
//           at Test.bound [as is] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:90:32)
//           at Test.<anonymous> (/home/izelnakri/ava-test/tape.js:25:5)
//   ...
// not ok 8 plan != count
//   ---
//     operator: fail
//     expected: 5
//     actual:   4
//     stack: |-
//       Error: plan != count
//           at Test.assert [as _assert] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:269:54)
//           at Test.bound [as _assert] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:90:32)
//           at Test.fail (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:363:10)
//           at Test.bound [as fail] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:90:32)
//           at Test._end (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:209:14)
//           at Test.bound [as _end] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:90:32)
//           at Test.end (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:190:10)
//           at Test.bound [as end] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:90:32)
//           at onResolve (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:117:22)
//   ...
// # deepEqual true works
// not ok 9 should be deeply equivalent
//   ---
//     operator: deepEqual
//     expected: |-
//       { firstName: 'Isaac', lastName: 'Nakri' }
//     actual: |-
//       { firstName: 'Izel', lastName: 'Nakri' }
//     at: Test.<anonymous> (/home/izelnakri/ava-test/tape.js:31:5)
//     stack: |-
//       Error: should be deeply equivalent
//           at Test.assert [as _assert] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:269:54)
//           at Test.bound [as _assert] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:90:32)
//           at Test.tapeDeepEqual (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:510:10)
//           at Test.bound [as deepEqual] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:90:32)
//           at Test.<anonymous> (/home/izelnakri/ava-test/tape.js:31:5)
//           at Test.bound [as _cb] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:90:32)
//           at Test.run (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:107:31)
//           at Test.bound [as run] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:90:32)
//           at Immediate.next [as _onImmediate] (/home/izelnakri/ava-test/node_modules/tape/lib/results.js:89:19)
//           at processImmediate (node:internal/timers:463:21)
//   ...
// not ok 10 test exited without ending: deepEqual true works
//   ---
//     operator: fail
//     at: process.<anonymous> (/home/izelnakri/ava-test/node_modules/tape/index.js:85:19)
//     stack: |-
//       Error: test exited without ending: deepEqual true works
//           at Test.assert [as _assert] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:269:54)
//           at Test.bound [as _assert] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:90:32)
//           at Test.fail (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:363:10)
//           at Test.bound [as fail] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:90:32)
//           at Test._exit (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:226:14)
//           at Test.bound [as _exit] (/home/izelnakri/ava-test/node_modules/tape/lib/test.js:90:32)
//           at process.<anonymous> (/home/izelnakri/ava-test/node_modules/tape/index.js:85:19)
//           at process.emit (node:events:376:20)
//   ...

