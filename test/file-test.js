import test from 'ava';
import fs from 'fs/promises';
import { promisify } from 'util';
import { exec } from 'child_process';

const shell = promisify(exec);

// TODO: also test with #line number test cases
test('testing a single passing js file works', async (t) => {
  let passingTestContent = await fs.readFile('./test/helpers/passing-tests.js');

  await fs.writeFile('./tmp/test/passing-tests.js', passingTestContent.toString());

  const { stdout } = await shell('node cli.js tmp/test/passing-tests.js');

  console.log(stdout);
  t.true(new RegExp(`TAP version 13
ok 1 {{moduleName}} | assert true works # (\d+ ms)
ok 2 {{moduleName}} | async test finishes # (\d+ ms)
ok 3 {{moduleName}} | deepEqual true works # (\d+ ms)

1..3
# tests 3
# pass 3
# skip 0
# fail 0`).test(stdout));
});

test('testing a single failing js file works', async (t) => {
  let failingTestContent = await fs.readFile('./test/helpers/failing-tests.js');

  await fs.writeFile('./tmp/test/failing-tests.js', failingTestContent.toString());

  try {
    await shell('node cli.js tmp/test/failing-tests.js');
  } catch(cmd) {
    // TODO: fix regex
    console.log(cmd.stdout);
    t.true(cmd.stdout.includes('TAP version 13'));
    t.true(new RegExp(`ok 1 {{moduleName}} | assert true works # (\d+ ms)`).test(cmd.stdout));
    t.true(new RegExp(`not ok 2 {{moduleName}} | async test finishes # (\d+ ms)␊
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
    t.true(new RegExp(`not ok 3 {{moduleName}} | runtime error output # (\d+ ms)
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
    t.true(new RegExp(`not ok 4 {{moduleName}} | deepEqual true works # (\d+ ms)␊
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
    t.true(cmd.stdout.includes('1..4'));
    t.true(cmd.stdout.includes('# tests 4'));
    t.true(cmd.stdout.includes('# pass 1'));
    t.true(cmd.stdout.includes('# skip 0'));
    t.true(cmd.stdout.includes('# fail 3'));
  }
});

// test('testing a single passing ts file works', async (t) => {

// });

// test('testing a single failing ts file works', async (t) => {

// });

// test('testing a single passing js file works', async (t) => {

// });

// test('testing a single failing js file works', async (t) => {

// });
