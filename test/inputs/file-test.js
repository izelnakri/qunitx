import assert from 'assert';
import fs from 'fs/promises';
import { promisify } from 'util';
import { exec } from 'child_process';
import { assertPassingTestCase, assertFailingTestCase, assertTAPResult } from '../helpers/assert-stdout.js';

const shell = promisify(exec);

describe('File Input Tests', () => {
  it('testing a single passing js file works', async function() {
    const { stdout } = await shell('node cli.js tmp/test/passing-tests.js');

    console.log(stdout);

    assertPassingTestCase(assert, stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });

  it('testing a single failing js file works', async function() {
    try {
      await shell('node cli.js tmp/test/failing-tests.js');
    } catch(cmd) {
      console.log(cmd.stdout);
      assert.ok(cmd.stdout.includes('TAP version 13'));
      assert.ok(cmd.stdout.includes('calling assert true test case'));
      assert.ok(new RegExp(`ok 1 {{moduleName}} | asserassert.ok works # (\d+ ms)`).test(cmd.stdout));
      assert.ok(cmd.stdout.includes('resolving async test'));
      assert.ok(cmd.stdout.includes(`{
  moduleName: 'called resolved async test with object',
  placeholder: 1000,
  anotherObject: { firstName: 'Izel', createdAt: 2021-03-06T00:00:00.000Z }
}`));
      assert.ok(new RegExp(`not ok 2 {{moduleName}} | async test finishes # (\d+ ms)␊
        ---␊
          name: 'Assertion #1'␊
          actual: null␊
          expected: null␊
          message: 'Promise rejected during "async test finishes": wait is not a function'␊
          stack: |-␊
            TypeError: wait is not a function␊
                at Object.<anonymous> (file://\w+/tmp/test/failing-tests.js:\d+:\d+)␊
          at: '\w+/tmp/test/failing-tests.js:\d+:\d+'␊
        ...␊
        ---␊
          name: 'Assertion #2'␊
          actual: null␊
          expected: null␊
          message: 'Expected 4 assertions, but 1 were run'␊
          stack: '    at Object.<anonymous> (file://\w+/tmp/test/failing-tests.js:\d+:\d+)'␊
          at: '\w+/tmp/test/failing-tests.js:\d+:\d+'␊
        ...`).test(cmd.stdout));
      assert.ok(cmd.stdout.includes('calling deepEqual test case'));
      assert.ok(new RegExp(`not ok 3 {{moduleName}} | runtime error output # (\d+ ms)
      ---
        name: 'Assertion #1'
        actual: null
        expected: true
        message: null
        stack: '    at Object.<anonymous> (file://\w+/tmp/test/failing-tests.js:\d+:\d+)'
        at: '\w+/tmp/test/failing-tests.js:\d+:\d+'
      ...
      ---
        name: 'Assertion #2'
        actual: null
        expected: null
        message: >-
          Died on test #2     at Object.<anonymous>
          (file://\w+/tmp/test/failing-tests.js:\d+:\d+): Cannot
          read property 'second' of undefined
        stack: |-
          TypeError: Cannot read property 'second' of undefined
              at Object.<anonymous> (file://\w+/tmp/test/failing-tests.js:\d+:\d+)
        at: '\w+/tmp/test/failing-tests.js:\d+:\d+'
      ...
    `).test(cmd.stdout));
      assert.ok(new RegExp(`not ok 4 {{moduleName}} | deepEqual true works # (\d+ ms)␊
        ---␊
          name: 'Assertion #1'␊
          actual:␊
            firstName: Izel␊
            lastName: Nakri␊
          expected:␊
            firstName: Isaac␊
            lastName: Nakri␊
          message: null␊
          stack: '    at Object.<anonymous> (file://\w+/tmp/test/failing-tests.js:\d+:\d+)'␊
          at: '\w+/tmp/test/failing-tests.js:\d+:\d+'␊
        ...␊`).test(cmd.stdout));
      assert.ok(cmd.stdout.includes('1..4'));
      assert.ok(cmd.stdout.includes('# tests 4'));
      assert.ok(cmd.stdout.includes('# pass 1'));
      assert.ok(cmd.stdout.includes('# skip 0'));
      assert.ok(cmd.stdout.includes('# fail 3'));
    }
  });

  // test.skip('testing a single passing ts file works', async function() {
  // });

  // test.skip('testing a single failing ts file works', async function() {
  // });

  it('testing a single passing js file with --browser works, console output supressed', async function() {
    const { stdout } = await shell('node cli.js tmp/test/passing-tests.js --browser');

    console.log(stdout);
    assertPassingTestCase(assert, stdout, { testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });

  it('testing a single passing js file with --browser --debug works', async function() {
    const { stdout } = await shell('node cli.js tmp/test/passing-tests.js --browser --debug');

    console.log(stdout);
    assert.ok(new RegExp(/websocket server running on port \d+/).test(stdout));
    assert.ok(new RegExp(/http server running on port \d+/).test(stdout));
    assert.ok(stdout.includes('TAP version 13'));
    assertPassingTestCase(assert, stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });

  it('testing a single failing js with --browser file works', async function() {
    try {
      let { stdout } = await shell('node cli.js tmp/test/failing-tests.js --browser');
      console.log(stdout);
    } catch(cmd) {
      console.log(cmd.stdout);
      assert.ok(cmd.stdout.includes('TAP version 13'));

      assertFailingTestCase(assert, cmd.stdout, { testNo: 1, moduleName: '{{moduleName}}' });
      assertTAPResult(assert, cmd.stdout, { testCount: 4, failCount: 3 });
    }
  });

  it('testing a single failing js file with --browser --debug works', async function() {
    try {
      await shell('node cli.js tmp/test/failing-tests.js --browser --debug');
    } catch(cmd) {
      console.log(cmd.stdout);
      assert.ok(cmd.stdout.includes('TAP version 13'));

      assertFailingTestCase(assert, cmd.stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
      assertTAPResult(assert, cmd.stdout, { testCount: 4, failCount: 3 });
    }
  });

  it('testing a single passing ts file with --browser works, console output supressed', async function() {
    const { stdout } = await shell('node cli.js tmp/test/passing-tests.ts --browser');

    console.log(stdout);
    assert.ok(stdout.includes('TAP version 13'));

    assertPassingTestCase(assert, stdout, { testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });

  it('testing a single passing ts file with --browser --debug works', async function() {
    const { stdout } = await shell('node cli.js tmp/test/passing-tests.ts --browser --debug');

    console.log(stdout);
    assert.ok(new RegExp(/websocket server running on port \d+/).test(stdout));
    assert.ok(new RegExp(/http server running on port \d+/).test(stdout));
    assert.ok(stdout.includes('TAP version 13'));

    assertPassingTestCase(assert, stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
    assertTAPResult(assert, stdout, { testCount: 3 });
  });

  it('testing a single failing ts with --browser file works', async function() {
    try {
      let { stdout } = await shell('node cli.js tmp/test/failing-tests.ts --browser');
      console.log('STDOUT is');
      console.log(stdout);
    } catch(cmd) {
      console.log(cmd.stdout);
      assert.ok(cmd.stdout.includes('TAP version 13'));

      assertPassingTestCase(assert, cmd.stdout, { testNo: 1, moduleName: '{{moduleName}}' });
      assertTAPResult(assert, cmd.stdout, { testCount: 4, failCount: 3 });
    }
  });

  it('testing a single failing ts file with --browser --debug works', async function() {
    try {
      let { stdout } = await shell('node cli.js tmp/test/failing-tests.ts --browser --debug');
      console.log('STDOUT is');
      console.log(stdout);
    } catch(cmd) {
      console.log(cmd.stdout);
      assert.ok(cmd.stdout.includes('TAP version 13'));

      assertPassingTestCase(assert, cmd.stdout, { debug: true, testNo: 1, moduleName: '{{moduleName}}' });
      assertTAPResult(assert, cmd.stdout, { testCount: 4, failCount: 3 });
    }
  });
});
