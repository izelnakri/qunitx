import { it } from 'node:test';
import type Assert from '../shared/assert.ts';
import config from '../shared/config.ts';
import ModuleContext from '../shared/module-context.ts';
import TestContext from '../shared/test-context.ts';
import type { EachCallback, EachData, IfTest, OnlyTest, SkipTest, TestContent, TodoTest } from '../types.ts';
import { printTestNameWithEach, runEach } from '../shared/each.ts';
import { callAtLocation, captureCallerLocation } from './caller-location.ts';
import { getNodeRunnerOptions } from './get-node-runner-options.ts';

/**
 * Defines an individual test within a module for Node's built-in test runner.
 *
 * Wraps `it()` from `node:test` and handles the full QUnit lifecycle:
 * beforeEach/afterEach hooks, async assertion waiting, and step verification.
 *
 * Must be called inside a `module()` callback.
 *
 * @param {string} testName - Name of the test.
 * @param {object} [runtimeOptions] - Optional Node test runner options forwarded to `it()`.
 *   Use `{ skip: true | string }` to skip the test, `{ todo: true | string }` to mark it as todo.
 *   Other Node options like `{ concurrency: true }` or `{ timeout: 5000 }` are forwarded as-is.
 * @param {function} testContent - Test callback receiving `(assert, { testName, options, context })`.
 *   `context` is the per-test environment — inherits properties set by `before`/`beforeEach` hooks,
 *   and is the same object as `this` in regular-function callbacks. Useful when using arrow functions.
 * @returns {void}
 * @example
 * ```js
 * import { module, test } from "qunitx";
 *
 * module("Math", () => {
 *   test("addition", (assert) => {
 *     assert.equal(1 + 1, 2);
 *   });
 *
 *   test("async resolves correctly", async (assert) => {
 *     const result = await Promise.resolve(42);
 *     assert.strictEqual(result, 42);
 *   });
 * });
 * ```
 */
function test(testName: string, testContent: (assert: Assert, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>): void;
/** Defines an individual test with optional Node test runner options forwarded to `it()`. */
function test(testName: string, runtimeOptions: object, testContent: (assert: Assert, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>): void;
function test(
  testName: string,
  runtimeOptions: object | ((assert: Assert, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>),
  testContent?: (assert: Assert, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>,
): void {
  const loc = captureCallerLocation(test);
  const moduleContext = ModuleContext.lastModule;
  if (!moduleContext) {
    throw new Error(`Test '${testName}' called outside of module context.`);
  }

  const targetRuntimeOptions = testContent ? runtimeOptions as object : {};
  const { skip, todo, only } = targetRuntimeOptions as { skip?: boolean | string; todo?: boolean | string; only?: boolean };

  // skip: no TestContext — finish() would fire "0 assertions" from afterAll otherwise.
  if (skip) {
    callAtLocation(it, loc, testName, { skip }, async function () {});
    return;
  }

  const targetTestContent = (testContent ?? runtimeOptions) as (assert: Assert, meta: { testName: string; options: unknown }) => void | Promise<void>;
  const context = new TestContext(testName, moduleContext);

  if (only) ModuleContext.focus.active = true;
  const focused = moduleContext.isFocused(!!only);
  moduleContext.registerRunnableTest(focused);

  // todo: exclude from finish() loop — todo tests may have zero or failing assertions.
  // Node's { todo } on it() handles the result; we just prevent afterAll from calling finish().
  if (todo) moduleContext.tests.pop();

  callAtLocation(it,  loc, testName, getNodeRunnerOptions(targetRuntimeOptions), function (nodeTest: { skip(message?: string): void }) {
    // Once any test or module is `only`, the others are skipped, as in QUnit. Decided
    // here, when the test runs: every test is declared by then, before or after the `only`.
    if (ModuleContext.focus.active && !focused) {
      nodeTest.skip('not `only`');
      return;
    }
    context.started = true;
    const { promise, resolve, reject } = Promise.withResolvers<void>();
    context.rejectTimeout = reject;
    // An explicit Node `{ timeout }` is Node's to enforce; ours would cut it short.
    // `config.testTimeout = 0` turns the default off.
    if (config.testTimeout > 0 && typeof (targetRuntimeOptions as { timeout?: unknown }).timeout !== 'number') {
      context.setTimeoutDuration(config.testTimeout);
    }

    // Taken now rather than when the test was declared, so it includes what the
    // module's before() hooks set.
    const userContext = moduleContext.createTestUserContext();
    context.userContext = userContext;
    const hookMeta = { context: userContext };

    (async () => {
      try {
        const eachHooks = moduleContext.getEachHooks();
        for (const hook of eachHooks.beforeEach) {
          await hook.call(userContext, context.assert!, hookMeta);
          if (context.asyncOps.length > 0) await context.assert!.waitForAsyncOps();
        }

        await targetTestContent.call(userContext, context.assert!, { testName, options: targetRuntimeOptions, context: userContext });

        // Skip the microtask hop when no `assert.async()` callbacks were registered.
        if (context.asyncOps.length > 0) await context.assert!.waitForAsyncOps();

        for (const hook of eachHooks.afterEach) {
          await hook.call(userContext, context.assert!, hookMeta);
          if (context.asyncOps.length > 0) await context.assert!.waitForAsyncOps();
        }

        resolve();
      } catch (err) {
        reject(err);
      } finally {
        context.clearTimeoutHandle();
      }
    })();

    return promise;
  });
}

/**
 * Registers a skipped test. Equivalent to `QUnit.test.skip`.
 * The test body is never executed; reported as skipped by Node's runner.
 *
 * @param {string} testName - Name of the test to skip.
 * @param {function} [_testContent] - Optional body (ignored — the test will not run).
 * @example
 * ```js
 * import { module, test } from "qunitx";
 *
 * module("Math", () => {
 *   test.skip("addition is not yet implemented", (assert) => {
 *     assert.equal(1 + 1, 2);
 *   });
 * });
 * ```
 */
test.skip = Object.assign(function skipTest(testName: string, _testContent?: unknown): void {
  callAtLocation(it, captureCallerLocation(skipTest), testName, { skip: true }, async function () {});
}, {
  /**
   * Registers a skipped test for each case of `dataset`, named as {@linkcode test.each}
   * names them. Equivalent to `QUnit.test.skip.each`.
   *
   * @param {string} testName - Name shared by the cases.
   * @param {Array|object} dataset - The cases.
   */
  each(testName: string, dataset: EachData<unknown>, _callback?: unknown): void {
    runEach(dataset, (_data, key) => test.skip(printTestNameWithEach(testName, key)));
  },
}) as SkipTest;

/**
 * Registers a todo test. Equivalent to `QUnit.test.todo`.
 * If a body is provided it runs, but failing assertions do not fail the suite.
 * Node reports the test with a `# TODO` marker. The callback is optional.
 *
 * @param {string} testName - Name of the test to mark as todo.
 * @param {function} [testContent] - Optional test body receiving `(assert, { testName, options, context })`.
 * @example
 * ```js
 * import { module, test } from "qunitx";
 *
 * module("Math", () => {
 *   test.todo("division is not yet implemented");
 *
 *   test.todo("multiplication", (assert) => {
 *     assert.equal(2 * 3, 6);
 *   });
 * });
 * ```
 */
test.todo = Object.assign(function todoTest(testName: string, testContent?: (assert: Assert, meta: { testName: string; options: unknown }) => void | Promise<void>): void {
  if (!testContent) {
    callAtLocation(it, captureCallerLocation(todoTest), testName, { todo: true }, function (nodeTest: { skip(message?: string): void }) {
      if (ModuleContext.focus.active) nodeTest.skip('not `only`');
    });
    return;
  }
  test(testName, { todo: true }, testContent);
}, {
  /**
   * Registers a todo test for each case of `dataset`, named as {@linkcode test.each}
   * names them. Equivalent to `QUnit.test.todo.each`.
   *
   * @param {string} testName - Name shared by the cases.
   * @param {Array|object} dataset - The cases.
   * @param {function} callback - Test body receiving `(assert, data, { testName, options, context })`.
   */
  each<T>(testName: string, dataset: EachData<T>, callback: EachCallback<Assert, T>): void {
    runEach(dataset, (data, key) => {
      test(printTestNameWithEach(testName, key), { todo: true }, function (this: Record<string, unknown>, assert, meta) {
        return callback.call(this, assert, data as T, meta);
      });
    });
  },
}) as TodoTest<Assert>;

/**
 * Defines a test that runs only when `condition` is truthy, and is skipped otherwise.
 * Equivalent to `QUnit.test.if`.
 *
 * @param {string} testName - Name of the test.
 * @param {unknown} condition - Whether to run the test.
 * @param {function} testContent - Test callback receiving `(assert, { testName, options, context })`.
 * @example
 * ```js
 * import { module, test } from "qunitx";
 *
 * module("Intl", () => {
 *   test.if("formats lists", typeof Intl.ListFormat === "function", (assert) => {
 *     assert.strictEqual(new Intl.ListFormat("en").format(["a", "b"]), "a and b");
 *   });
 * });
 * ```
 */
test.if = Object.assign(function ifTest(testName: string, condition: unknown, testContent: TestContent<Assert>): void {
  if (condition) test(testName, testContent);
  else test.skip(testName);
}, {
  /**
   * {@linkcode test.each}, run only when `condition` is truthy. Equivalent to `QUnit.test.if.each`.
   *
   * @param {string} testName - Name shared by the cases.
   * @param {unknown} condition - Whether to run the cases.
   * @param {Array|object} dataset - The cases.
   * @param {function} callback - Test body receiving `(assert, data, { testName, options, context })`.
   */
  each<T>(testName: string, condition: unknown, dataset: EachData<T>, callback: EachCallback<Assert, T>): void {
    if (condition) test.each(testName, dataset, callback);
    else test.skip.each(testName, dataset);
  },
}) as IfTest<Assert>;

/**
 * Runs only this test, and any other `only` test or module: every other test is skipped.
 * Equivalent to `QUnit.test.only`, and to passing `{ only: true }`.
 * On Node.js, qunitx skips the other tests itself; started with `--test-only`, Node
 * does too.
 *
 * @param {string} testName - Name of the test.
 * @param {object} [runtimeOptions] - Optional options, as for {@linkcode test}.
 * @param {function} testContent - Test callback receiving `(assert, { testName, options, context })`.
 * @example
 * ```js
 * import { module, test } from "qunitx";
 *
 * module("Math", () => {
 *   test.only("the one being worked on", (assert) => {
 *     assert.equal(1 + 1, 2);
 *   });
 * });
 * ```
 */
test.only = Object.assign(function onlyTest(
  testName: string,
  runtimeOptionsOrContent: object | TestContent<Assert>,
  testContent?: TestContent<Assert>,
): void {
  const [options, content] = testContent
    ? [runtimeOptionsOrContent as object, testContent]
    : [{}, runtimeOptionsOrContent as TestContent<Assert>];
  test(testName, { ...options, only: true }, content);
}, {
  /**
   * {@linkcode test.each}, with every case `only`. Equivalent to `QUnit.test.only.each`.
   *
   * @param {string} testName - Name shared by the cases.
   * @param {Array|object} dataset - The cases.
   * @param {function} callback - Test body receiving `(assert, data, { testName, options, context })`.
   */
  each<T>(testName: string, dataset: EachData<T>, callback: EachCallback<Assert, T>): void {
    runEach(dataset, (data, key) => {
      test(printTestNameWithEach(testName, key), { only: true }, function (this: Record<string, unknown>, assert, meta) {
        return callback.call(this, assert, data as T, meta);
      });
    });
  },
}) as OnlyTest<Assert>;

/**
 * Defines one test per case of `dataset`, each receiving its case as `data`.
 * Equivalent to `QUnit.test.each`, and names the cases as it does: `name [value]` for a
 * short string, `name [index: value]` for other primitives, `name [index]` otherwise,
 * and `name [key]` for an object dataset.
 *
 * @param {string} testName - Name shared by the cases.
 * @param {Array|object} dataset - The cases.
 * @param {function} callback - Test body receiving `(assert, data, { testName, options, context })`.
 * @example
 * ```js
 * import { module, test } from "qunitx";
 *
 * module("Math", () => {
 *   test.each("is even", [2, 4, 6], (assert, n) => {
 *     assert.strictEqual(n % 2, 0);
 *   });
 * });
 * ```
 */
test.each = function eachTest<T>(testName: string, dataset: EachData<T>, callback: EachCallback<Assert, T>): void {
  runEach(dataset, (data, key) => {
    test(printTestNameWithEach(testName, key), function (this: Record<string, unknown>, assert, meta) {
      return callback.call(this, assert, data as T, meta);
    });
  });
};


// Exported here rather than on the declarations above: `export default function` on an
// overload set that also carries a namespace merge (.skip/.todo) emits a .d.ts with two
// `export default` statements, which is invalid TypeScript (TS2528/TS2652/TS2383) and
// breaks consumers that typecheck with `skipLibCheck: false`.
export default test;
