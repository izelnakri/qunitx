export function assertStdout(assert, folderNames, options={ checkFailure: false, browser: false, debug: false }) {
  // folderNames.forEach((folder
}

export function assertPassingTestCase(assert, stdout, options={ moduleName: '{{moduleName}}', debug: false }) {
  let testNo = options.testNo || 1;
  let { moduleName, debug } = options;

  if (debug) {
    return assert.ok(new RegExp(`ok ${testNo} ${moduleName} | asserassert.ok works # (\d+ ms)
    resolving async test
    {
      moduleName: 'called resolved async test with object',
      placeholder: 1000,
      anotherObject: { firstName: 'Izel', createdAt: 2021-03-06T00:00:00.000Z }
    }
    ok ${testNo++} ${moduleName} | async test finishes # (\d+ ms)
    calling deepEqual test case
    ok ${testNo++} ${moduleName} | deepEqual true works # (\d+ ms)`).test(stdout));
  }

  return assert.ok(new RegExp(`ok ${testNo} ${moduleName} | asserassert.ok works # (\d+ ms)
    ok ${testNo++} ${moduleName} | async test finishes # (\d+ ms)
    ok ${testNo++} ${moduleName} | deepEqual true works # (\d+ ms)`).test(stdout));
}

export function assertFailingTestCase(assert, stdout, options={ moduleName: '{{moduleName}}', debug: false }) {
  let testNo = options.testNo || 1;
  let { moduleName, debug } = options;

  if (debug) {
    assert.ok(stdout.includes('calling assert true test case'));
    assert.ok(stdout.includes('resolving async test'));
    assert.ok(stdout.includes(`{
  moduleName: 'called resolved async test with object',
  placeholder: 1000,
  anotherObject: {`));
  } else {
    assert.ok(!stdout.includes('calling assert true test case'));
    assert.ok(!stdout.includes('resolving async test'));
    assert.ok(!stdout.includes(`{
  moduleName: 'called resolved async test with object',
  placeholder: 1000,
  anotherObject: {`));
  }

    assert.ok(new RegExp(`not ok 2 ${moduleName} | async test finishes # (\d+ ms)␊
        ---␊
          name: 'Assertion #1'␊
          actual: null␊
          expected: null␊
          message: 'Promise rejected during "async test finishes": wait is not a function'␊
          stack: |-␊
            TypeError: wait is not a function␊
                at Object.<anonymous> (\S+:\d+:\d+)␊
          at: '\S+:\d+:\d+'␊
        ...␊
        ---␊
          name: 'Assertion #2'␊
          actual: null␊
          expected: null␊
          message: 'Expected 4 assertions, but 1 were run'␊
          stack: '    at Object.<anonymous> (\S+:\d+:\d+)'␊
          at: '\S+:\d+:\d+'␊
        ...`).test(stdout));
    assert.ok(new RegExp(`not ok 3 ${moduleName} | runtime error output # (\d+ ms)
      ---
        name: 'Assertion #1'
        actual: null
        expected: true
        message: null
        stack: '    at Object.<anonymous> (\S+:\d+:\d+)'
        at: '\S+:\d+:\d+'
      ...
      ---
        name: 'Assertion #2'
        actual: null
        expected: null
        message: >-
          Died on test #2     at Object.<anonymous>
          (\S+:\d+:\d+): Cannot
          read property 'second' of undefined
        stack: |-
          TypeError: Cannot read property 'second' of undefined
              at Object.<anonymous> (\S+:\d+:\d+)
        at: '\S+:\d+:\d+'
      ...
    `).test(stdout));
    assert.ok(new RegExp(`not ok 4 ${moduleName} | deepEqual true works # (\d+ ms)␊
        ---␊
          name: 'Assertion #1'␊
          actual:␊
            firstName: Izel␊
            lastName: Nakri␊
          expected:␊
            firstName: Isaac␊
            lastName: Nakri␊
          message: null␊
          stack: '    at Object.<anonymous> (\S+:\d+:\d+)'␊
          at: '\S+:\d+:\d+'␊
        ...␊`).test(stdout));
}

export function assertTAPResult(assert, stdout, options={ testCount: 0, failCount: 0 }) {
  if (options.failCount) {
    let passCount = options.testCount - options.failCount;

    return assert.ok(new RegExp(`1..(${options.testCount}|${options.testCount + 1})
# tests (${options.testCount}|${options.testCount + 1})
# pass ${options.testCount - options.failCount}
# skip 0
# fail (${options.failCount}|${options.failCount + 1})`).test(stdout));
  }

  assert.ok(new RegExp(`1..${options.testCount}
# tests ${options.testCount}
# pass ${options.testCount}
# skip 0
# fail 0`).test(stdout));
}

export default {
  assertStdout,
  assertPassingTestCase,
  assertFailingTestCase,
  assertTAPResult
}
