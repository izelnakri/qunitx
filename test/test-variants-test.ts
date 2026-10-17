// @ts-nocheck
// test.each(), test.if(), module.if() and global hooks: QUnit 2.x APIs, behaving the
// same on Node.js and Deno as QUnit makes them behave in the browser.
import { hooks, module, test } from 'qunitx';

module('test.each', function () {
  const seenNumbers = [];
  test.each('array dataset', [1, 2, 3], function (assert, n) {
    seenNumbers.push(n);
    assert.strictEqual(typeof n, 'number');
  });

  const seenCases = {};
  test.each('object dataset', { two: [1, 1, 2], five: [2, 3, 5] }, function (assert, [a, b, sum]) {
    seenCases[sum] = [a, b];
    assert.strictEqual(a + b, sum);
  });

  test('every case ran, once, with its own data', function (assert) {
    assert.deepEqual(seenNumbers, [1, 2, 3]);
    assert.deepEqual(seenCases, { 2: [1, 1], 5: [2, 3] });
  });

  module('with hooks', function (hooks) {
    hooks.beforeEach(function () {
      this.multiplier = 10;
    });

    test.each('cases get the test context as this', [1, 2], function (assert, n) {
      assert.strictEqual(this.multiplier * n, n * 10);
    });
  });

  test.skip.each('skip.each', [1, 2], function (assert) {
    assert.true(false, 'never runs');
  });

  test.todo.each('todo.each', [1, 2], function (assert) {
    assert.true(false, 'expected to fail');
  });

  const seenIf = [];
  test.if.each('if.each with a true condition', true, ['a', 'b'], function (assert, value) {
    seenIf.push(value);
    assert.true(true);
  });
  test.if.each('if.each with a false condition', false, ['c'], function (assert) {
    assert.true(false, 'never runs');
  });

  test('if.each ran only the cases whose condition was true', function (assert) {
    assert.deepEqual(seenIf, ['a', 'b']);
  });

  test('rejects a dataset that is not an array or object', function (assert) {
    assert.throws(() => test.each('bad', 42, () => {}), TypeError);
  });
});

// The names QUnit 3.0.0 gives these datasets, from its own test/cli/fixtures/each-array-labels.
// In the browser they come from QUnit itself, on Node.js and Deno from shims/shared/each.ts.
module('test.each names', function () {
  const names = [];
  const record = (assert, _data, { testName }) => {
    names.push(testName);
    assert.true(true);
  };

  test.each(
    'array of arrays',
    [
      [1, 2, 3],
      [1, 1, 2],
    ],
    record,
  );
  test.each(
    'array of simple strings',
    ['foo', 'x'.repeat(40), '$', 'http://example.org', ' ', ''],
    record,
  );
  test.each(
    'array of mixed',
    [
      undefined,
      null,
      false,
      true,
      0,
      1,
      -10,
      10 / 3,
      10e42,
      Infinity,
      NaN,
      [],
      {},
      '999: example',
      'simple string',
      '\b',
      '\n',
      'y'.repeat(100),
    ],
    record,
  );
  test.each('keyed objects', { caseFoo: [1, 2, 3], caseBar: [1, 1, 2] }, record);

  test('names each case as QUnit does', function (assert) {
    assert.deepEqual(names, [
      'array of arrays [0]',
      'array of arrays [1]',
      'array of simple strings [foo]',
      'array of simple strings [xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx]',
      'array of simple strings [$]',
      'array of simple strings [http://example.org]',
      'array of simple strings [ ]',
      'array of simple strings []',
      'array of mixed [0: undefined]',
      'array of mixed [1: null]',
      'array of mixed [2: false]',
      'array of mixed [3: true]',
      'array of mixed [4: 0]',
      'array of mixed [5: 1]',
      'array of mixed [6: -10]',
      'array of mixed [7: 3.3333333333333335]',
      'array of mixed [8: 1e+43]',
      'array of mixed [9: Infinity]',
      'array of mixed [10: NaN]',
      'array of mixed [11]',
      'array of mixed [12]',
      'array of mixed [13: 999: example]',
      'array of mixed [simple string]',
      'array of mixed [15]',
      'array of mixed [16]',
      'array of mixed [17: yyyyyyyyyyyyyyyyyyyyyyyyyyyyy…]',
      'keyed objects [caseFoo]',
      'keyed objects [caseBar]',
    ]);
  });
});

module('test.if', function () {
  const ran = [];
  test.if('runs when the condition is truthy', 1, function (assert) {
    ran.push('truthy');
    assert.true(true);
  });
  test.if('is skipped when the condition is falsy', 0, function (assert) {
    assert.true(false, 'never runs');
  });

  test('ran only the test whose condition was truthy', function (assert) {
    assert.deepEqual(ran, ['truthy']);
  });
});

module('module.if', function () {
  const ran = [];
  module.if('runs when the condition is truthy', true, function () {
    test('inside', function (assert) {
      ran.push('truthy');
      assert.true(true);
    });
  });
  module.if('is skipped when the condition is falsy', false, function () {
    test('inside', function (assert) {
      assert.true(false, 'never runs');
    });
  });
  module.if('takes runtime options before the callback', true, {}, function () {
    test('inside', function (assert) {
      ran.push('with options');
      assert.true(true);
    });
  });

  test('ran only the modules whose condition was truthy', function (assert) {
    assert.deepEqual(ran, ['truthy', 'with options']);
  });
});

// Global hooks run for every test in the run, so these record only inside the module
// below: its before() puts a `globalHookTrace` on the module context, which each test's
// context copies. The order is QUnit 3.0.0's, from test/cli/fixtures/hooks-global-order.
// They must not assert: an assertion here would count in every test of the run.
hooks.beforeEach(function (_assert, { context }) {
  this.globalHookTrace?.push(this === context ? 'global beforeEach-1' : 'wrong context');
});
hooks.beforeEach(function () {
  this.globalHookTrace?.push('global beforeEach-2');
});
hooks.afterEach(function () {
  this.globalHookTrace?.push('global afterEach-1');
});
hooks.afterEach(function () {
  this.globalHookTrace?.push('global afterEach-2');
});

module('global hooks', function (moduleHooks) {
  const trace = [];
  moduleHooks.before(function () {
    this.globalHookTrace = trace;
  });
  moduleHooks.beforeEach(function () {
    this.globalHookTrace.push('module beforeEach');
  });
  moduleHooks.afterEach(function () {
    this.globalHookTrace.push('module afterEach');
  });

  test('records the hooks around it', function (assert) {
    this.globalHookTrace.push('test');
    assert.true(true);
  });

  test('wrap module hooks, beforeEach in order and afterEach in reverse', function (assert) {
    assert.deepEqual(trace.slice(0, 7), [
      'global beforeEach-1',
      'global beforeEach-2',
      'module beforeEach',
      'test',
      'module afterEach',
      'global afterEach-2',
      'global afterEach-1',
    ]);
  });
});

// A global hook added once the run has started applies to every test after it, as in
// QUnit: the hooks a module's tests run are re-resolved when one is added.
module('global hooks added during the run', function (moduleHooks) {
  const trace = [];
  moduleHooks.before(function () {
    this.lateHookTrace = trace;
  });

  test('adds a global beforeEach', function (assert) {
    hooks.beforeEach(function () {
      this.lateHookTrace?.push('late global beforeEach');
    });
    assert.deepEqual(trace, []);
  });

  test('which runs before the tests after it', function (assert) {
    assert.deepEqual(trace, ['late global beforeEach']);
  });
});
