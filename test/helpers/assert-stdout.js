export function assertStdout(assert, folderNames, options={ checkFailure: false, debug: false }) {
  // folderNames.forEach((folder
}

export function assertPassingTestCase(assert, stdout, options={ moduleName: '{{moduleName}}', debug: false }) {
  let { moduleName, debug } = options;

  if (debug) {
    assert.ok(new RegExp(`ok \. ${moduleName} | assert.ok works # (\d+ ms)`).test(stdout));
    assert.ok(stdout.includes('resolving async test'));
    assert.ok(/(.+)placeholder(.+)/g.test(stdout));
    assert.ok(/(.+)anotherObject(.+)/g.test(stdout));
    assert.ok(new RegExp(`ok \. ${moduleName} | async test finishes # (\d+ ms)`).test(stdout));
    assert.ok(stdout.includes('calling deepEqual test case'));
    // assert.ok(new RegExp(`ok ${testNo++} ${moduleName} | deepEqual true works # (\d+ ms)`).test(stdout));
  } else {
    assert.ok(new RegExp(`ok \. ${moduleName} | assert.ok works # (\d+ ms)`).test(stdout));
    assert.ok(new RegExp(`ok \. ${moduleName} | async test finishes # (\d+ ms)`).test(stdout));
    // assert.ok(new RegExp(`ok ${testNo++} ${moduleName} | deepEqual true works # (\d+ ms)`).test(stdout));
  }
}

export function assertFailingTestCase(assert, stdout, options={ moduleName: '{{moduleName}}', debug: false }) {
  let { moduleName, debug } = options;

  if (debug) {
    assert.ok(stdout.includes('calling assert true test case'));
    assert.ok(stdout.includes('resolving async test'));
    assert.ok(/(.+)placeholder(.+)/g.test(stdout));
    assert.ok(/(.+)anotherObject(.+)/g.test(stdout));
  } else {
    assert.ok(!stdout.includes('calling assert true test case'));
    assert.ok(!stdout.includes('resolving async test'));
    assert.notOk(/(.+)placeholder(.+)/g.test(stdout));
    assert.notOk(/(.+)anotherObject(.+)/g.test(stdout));

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
}

export function assertTAPResult(assert, stdout, options={ testCount: 0, failCount: 0 }) {
  if (options.failCount) {
    return assert.ok(new RegExp(`# pass ${options.testCount - options.failCount}
# skip 0
# fail (${options.failCount}|${options.failCount + 1})`).test(stdout));
  }

  assert.ok(new RegExp(`# pass ${options.testCount}
# skip 0
# fail 0`).test(stdout));
}

export default {
  assertStdout,
  assertPassingTestCase,
  assertFailingTestCase,
  assertTAPResult
}
