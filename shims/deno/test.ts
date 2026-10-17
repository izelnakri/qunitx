import { it } from 'jsr:@std/testing@^1.0.17/bdd';
import type Assert from '../shared/assert.ts';
import config from '../shared/config.ts';
import { printTestNameWithEach, runEach } from '../shared/each.ts';
import ModuleContext from '../shared/module-context.ts';
import TestContext from '../shared/test-context.ts';
import type { EachCallback, EachData, IfTest, OnlyTest, SkipTest, TestContent, TodoTest } from '../types.ts';

/**
 * Defines an individual test within a module for Deno's BDD test runner.
 *
 * Wraps `it()` from `@std/testing/bdd` and handles the full QUnit lifecycle:
 * beforeEach/afterEach hooks, async assertion waiting, and step verification.
 *
 * Must be called inside a `module()` callback.
 *
 * @param {string} testName - Name of the test
 * @param {object} [runtimeOptions] - Optional options forwarded to `it()`.
 *   Use `{ skip: true | string }` to skip the test, `{ todo: true | string }` to mark it as todo
 *   (both map to Deno's `{ ignore: true }`). Other Deno BDD options like
 *   `{ concurrency: false }` or `{ sanitizeExit: false }` are forwarded as-is.
 * @param {function} testContent - Test callback receiving `(assert, { testName, options })`
 * @returns {void}
 * @example
 * ```js ignore
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
/** Defines an individual test with optional Deno BDD runtime options forwarded to `it()`. */
function test(testName: string, runtimeOptions: object, testContent: (assert: Assert, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>): void;
function test(
  testName: string,
  runtimeOptions: object | ((assert: Assert, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>),
  testContent?: (assert: Assert, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>,
): void {
  const moduleContext = ModuleContext.lastModule;
  if (!moduleContext) {
    throw new Error(`Test '${testName}' called outside of module context.`);
  }

  const targetRuntimeOptions = testContent ? runtimeOptions as object : {};
  const { skip, todo, only } = targetRuntimeOptions as { skip?: boolean | string; todo?: boolean | string; only?: boolean };

  // skip/todo: no TestContext — finish() would fire "0 assertions" from afterAll otherwise.
  // Deno uses `ignore` for both (no native todo concept).
  if (skip || todo) {
    it(testName, { ignore: true }, async function () {});
    return;
  }

  const targetTestContent = (testContent ?? runtimeOptions) as (assert: Assert, meta: { testName: string; options: unknown }) => void | Promise<void>;
  const context = new TestContext(testName, moduleContext);

  // Deno itself runs only the `only` tests, and skips the hooks of a module none of them
  // is in, so unlike Node.js it needs no `ModuleContext.focus`.
  const focused = moduleContext.isFocused(!!only);
  moduleContext.registerRunnableTest(focused);

  // Inside an `only` module, Deno drops a test that is not `only` itself once a sibling
  // suite is (see module.ts), so every focused test is passed `only` explicitly.
  it(testName, focused ? { ...targetRuntimeOptions, only: true } : { ...targetRuntimeOptions }, function () {
    context.started = true;
    const { promise, resolve, reject } = Promise.withResolvers<void>();
    context.rejectTimeout = reject;
    // `config.testTimeout = 0` turns the default off.
    if (config.testTimeout > 0) context.setTimeoutDuration(config.testTimeout);

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
 * The test body is never executed; the test is reported as ignored by Deno's runner.
 *
 * @param {string} testName - Name of the test to skip.
 * @param {function} [_testContent] - Optional body (ignored — the test will not run).
 * @example
 * ```js ignore
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
  it(testName, { ignore: true }, async function () {});
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
 * The test body is never executed; the test is reported as ignored by Deno's runner
 * (Deno has no native todo concept).
 *
 * @param {string} testName - Name of the test to mark as todo.
 * @param {function} [_testContent] - Optional body (ignored — the test will not run).
 * @example
 * ```js ignore
 * import { module, test } from "qunitx";
 *
 * module("Math", () => {
 *   test.todo("addition is not yet implemented", (assert) => {
 *     assert.equal(1 + 1, 2);
 *   });
 * });
 * ```
 */
test.todo = Object.assign(function todoTest(testName: string, _testContent?: unknown): void {
  it(testName, { ignore: true }, async function () {});
}, {
  /**
   * Registers a todo test for each case of `dataset`, named as {@linkcode test.each}
   * names them. Equivalent to `QUnit.test.todo.each`.
   *
   * @param {string} testName - Name shared by the cases.
   * @param {Array|object} dataset - The cases.
   * @param {function} callback - Test body receiving `(assert, data, { testName, options, context })`.
   */
  each<T>(testName: string, dataset: EachData<T>, _callback?: EachCallback<Assert, T>): void {
    runEach(dataset, (_data, key) => test.todo(printTestNameWithEach(testName, key)));
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
 * ```js ignore
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
 * Deno runs only these, and then fails the run on purpose, so that an `only` is
 * not committed by accident.
 *
 * @param {string} testName - Name of the test.
 * @param {object} [runtimeOptions] - Optional options, as for {@linkcode test}.
 * @param {function} testContent - Test callback receiving `(assert, { testName, options, context })`.
 * @example
 * ```js ignore
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
 * ```js ignore
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

export type { Assert };
export type { PushResultInfo } from '../types.ts';
