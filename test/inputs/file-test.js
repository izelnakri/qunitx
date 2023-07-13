import { module, test } from 'qunitx';
import { assertPassingTestCase, assertFailingTestCase, assertTAPResult } from '../helpers/assert-stdout.js';
import shell from '../helpers/shell.js';

module('File Input Tests', { concurrency: false }, (_hooks, moduleMetadata) => {
  // test('testing a single passing js file works', async (assert, testMetadata) => {
  //   const { stdout } = await shell('node tmp/test/passing-tests.js', { ...moduleMetadata, ...testMetadata });

  //   assertPassingTestCase(assert, stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
  //   assertTAPResult(assert, stdout, { testCount: 3 });
  // });

//   test('testing a single failing js file works', async (assert, testMetadata) => {
//     try {
//       await shell('node tmp/test/failing-tests.js', { ...moduleMetadata, ...testMetadata });
//     } catch(cmd) {
//       assert.ok(cmd.stdout.includes('TAP version 13'));
//       assert.ok(cmd.stdout.includes('calling assert true test case'));
//       assert.ok(new RegExp(`ok 1 {{moduleName}} | assert.ok works # (\d+ ms)`).test(cmd.stdout));
//       assert.ok(cmd.stdout.includes('resolving async test'));
//       assert.ok(cmd.stdout.includes(`{
//   moduleName: 'called resolved async test with object',
//   placeholder: 1000,
//   anotherObject: { firstName: 'Izel', createdAt: 2021-03-06T00:00:00.000Z }
// }`));
//       assert.ok(new RegExp(`not ok 2 {{moduleName}} | async test finishes # (\d+ ms)␊
//         ---␊
//           name: 'Assertion #1'␊
//           actual: null␊
//           expected: null␊
//           message: 'Promise rejected during "async test finishes": wait is not a function'␊
//           stack: |-␊
//             TypeError: wait is not a function␊
//                 at Object.<anonymous> (file://\w+/tmp/test/failing-tests.js:\d+:\d+)␊
//           at: '\w+/tmp/test/failing-tests.js:\d+:\d+'␊
//         ...␊
//         ---␊
//           name: 'Assertion #2'␊
//           actual: null␊
//           expected: null␊
//           message: 'Expected 4 assertions, but 1 were run'␊
//           stack: '    at Object.<anonymous> (file://\w+/tmp/test/failing-tests.js:\d+:\d+)'␊
//           at: '\w+/tmp/test/failing-tests.js:\d+:\d+'␊
//         ...`).test(cmd.stdout));
//       assert.ok(cmd.stdout.includes('calling deepEqual test case'));
//       assert.ok(new RegExp(`not ok 3 {{moduleName}} | runtime error output # (\d+ ms)
//       ---
//         name: 'Assertion #1'
//         actual: null
//         expected: true
//         message: null
//         stack: '    at Object.<anonymous> (file://\w+/tmp/test/failing-tests.js:\d+:\d+)'
//         at: '\w+/tmp/test/failing-tests.js:\d+:\d+'
//       ...
//       ---
//         name: 'Assertion #2'
//         actual: null
//         expected: null
//         message: >-
//           Died on test #2     at Object.<anonymous>
//           (file://\w+/tmp/test/failing-tests.js:\d+:\d+): Cannot
//           read property 'second' of undefined
//         stack: |-
//           TypeError: Cannot read property 'second' of undefined
//               at Object.<anonymous> (file://\w+/tmp/test/failing-tests.js:\d+:\d+)
//         at: '\w+/tmp/test/failing-tests.js:\d+:\d+'
//       ...
//     `).test(cmd.stdout));
//       assert.ok(new RegExp(`not ok 4 {{moduleName}} | deepEqual true works # (\d+ ms)␊
//         ---␊
//           name: 'Assertion #1'␊
//           actual:␊
//             firstName: Izel␊
//             lastName: Nakri␊
//           expected:␊
//             firstName: Isaac␊
//             lastName: Nakri␊
//           message: null␊
//           stack: '    at Object.<anonymous> (file://\w+/tmp/test/failing-tests.js:\d+:\d+)'␊
//           at: '\w+/tmp/test/failing-tests.js:\d+:\d+'␊
//         ...␊`).test(cmd.stdout));
//       assert.ok(cmd.stdout.includes('1..4'));
//       assert.ok(cmd.stdout.includes('# tests 4'));
//       assert.ok(cmd.stdout.includes('# pass 1'));
//       assert.ok(cmd.stdout.includes('# skip 0'));
//       assert.ok(cmd.stdout.includes('# fail 3'));
//     }
//   });

//   // test.skip('testing a single passing ts file works', async function() {
//   // });

//   // test.skip('testing a single failing ts file works', async function() {
//   // });

  test('testing a single passing js file with works, console output supressed', async (assert, testMetadata) => {
    const { stdout } = await shell('node cli.js tmp/test/passing-tests.js', { ...moduleMetadata, ...testMetadata });

    assertPassingTestCase(assert, stdout, { testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });

  test('testing a single passing js file with --debug works', async (assert, testMetadata) => {
    const { stdout } = await shell('node cli.js tmp/test/passing-tests.js --debug', { ...moduleMetadata, ...testMetadata });

    assert.ok(new RegExp(/# QUnitX running: http\:\/\/localhost:\d+/).test(stdout));
    assert.ok(stdout.includes('TAP version 13'));
    assertPassingTestCase(assert, stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });

  test('testing a single failing js file works', async (assert, testMetadata) => {
    try {
      let { stdout } = await shell('node cli.js tmp/test/failing-tests.js', { ...moduleMetadata, ...testMetadata });
    } catch(cmd) {
      assert.ok(cmd.stdout.includes('TAP version 13'));
      assertFailingTestCase(assert, cmd.stdout, { testNo: 1, moduleName: '{{moduleName}}' });
      assertTAPResult(assert, cmd.stdout, { testCount: 4, failCount: 3 });
    }
  });

  test('testing a single failing js file with --debug works', async (assert, testMetadata) => {
    try {
      await shell('node cli.js tmp/test/failing-tests.js --debug', { ...moduleMetadata, ...testMetadata });
    } catch(cmd) {
      assert.ok(cmd.stdout.includes('TAP version 13'));
      assertFailingTestCase(assert, cmd.stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
      assertTAPResult(assert, cmd.stdout, { testCount: 4, failCount: 3 });
    }
  });

  test('testing a single passing ts file works, console output supressed', async (assert, testMetadata) => {
    const { stdout } = await shell('node cli.js tmp/test/passing-tests.ts', { ...moduleMetadata, ...testMetadata });

    assert.ok(stdout.includes('TAP version 13'));
    assertPassingTestCase(assert, stdout, { testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });

  test('testing a single passing ts file with --debug works', async (assert, testMetadata) => {
    const { stdout } = await shell('node cli.js tmp/test/passing-tests.ts --debug', { ...moduleMetadata, ...testMetadata });

    assert.ok(new RegExp(/# QUnitX running: http\:\/\/localhost:\d+/).test(stdout));
    assert.ok(stdout.includes('TAP version 13'));

    assertPassingTestCase(assert, stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });

  test('testing a single failing ts file works', async (assert, testMetadata) => {
    try {
      await shell('node cli.js tmp/test/failing-tests.ts', { ...moduleMetadata, ...testMetadata });
    } catch(cmd) {
      assert.ok(cmd.stdout.includes('TAP version 13'));
      assertPassingTestCase(assert, cmd.stdout, { testNo: 1, moduleName: '{{moduleName}}' });
      assertTAPResult(assert, cmd.stdout, { testCount: 4, failCount: 3 });
    }
  });

  test('testing a single failing ts file with --debug works', async (assert, testMetadata) => {
    try {
      await shell('node cli.js tmp/test/failing-tests.ts --debug', { ...moduleMetadata, ...testMetadata });
    } catch(cmd) {
      assert.ok(cmd.stdout.includes('TAP version 13'));
      assertPassingTestCase(assert, cmd.stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
      assertTAPResult(assert, cmd.stdout, { testCount: 4, failCount: 3 });
    }
  });
});
