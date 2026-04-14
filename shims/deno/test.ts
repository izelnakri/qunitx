import { it } from 'jsr:@std/testing/bdd';
import type Assert from '../shared/assert.ts';
import ModuleContext from '../shared/module-context.ts';
import TestContext from '../shared/test-context.ts';

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
export default function test(testName: string, testContent: (assert: Assert, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>): void;
/** Defines an individual test with optional Deno BDD runtime options forwarded to `it()`. */
export default function test(testName: string, runtimeOptions: object, testContent: (assert: Assert, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>): void;
export default function test(
  testName: string,
  runtimeOptions: object | ((assert: Assert, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>),
  testContent?: (assert: Assert, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>,
): void {
  const moduleContext = ModuleContext.lastModule;
  if (!moduleContext) {
    throw new Error(`Test '${testName}' called outside of module context.`);
  }

  const targetRuntimeOptions = testContent ? runtimeOptions as object : {};
  const { skip, todo } = targetRuntimeOptions as { skip?: boolean | string; todo?: boolean | string };

  // skip/todo: no TestContext — finish() would fire "0 assertions" from afterAll otherwise.
  // Deno uses `ignore` for both (no native todo concept).
  if (skip || todo) {
    it(testName, { ignore: true }, async function () {});
    return;
  }

  const targetTestContent = (testContent ?? runtimeOptions) as (assert: Assert, meta: { testName: string; options: unknown }) => void | Promise<void>;
  const context = new TestContext(testName, moduleContext);

  // Each test gets a fresh plain object inheriting from the module's user context.
  // This matches QUnit's prototype-chain model: before() sets props on the module context,
  // tests inherit them, and each test's own writes don't pollute sibling tests.
  const userContext = Object.create(moduleContext.userContext);
  context.userContext = userContext;

  it(testName, { ...targetRuntimeOptions }, function () {
    const { promise, resolve, reject } = Promise.withResolvers<void>();
    context.rejectTimeout = reject;

    const hookMeta = { context: userContext };

    (async () => {
      try {
        for (const mod of context.module!.moduleChain) {
          for (const hook of mod.beforeEachHooks) {
            await hook.call(userContext, context.assert!, hookMeta);
          }
        }

        await targetTestContent.call(userContext, context.assert!, { testName, options: targetRuntimeOptions, context: userContext });

        await context.assert!.waitForAsyncOps();

        for (const mod of context.module!.moduleChain.toReversed()) {
          for (const hook of mod.afterEachHooks.toReversed()) {
            await hook.call(userContext, context.assert!, hookMeta);
          }
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
test.skip = function skipTest(testName: string, _testContent?: unknown): void {
  it(testName, { ignore: true }, async function () {});
};

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
test.todo = function todoTest(testName: string, _testContent?: unknown): void {
  it(testName, { ignore: true }, async function () {});
};

export type { Assert };
export type { PushResultInfo } from '../types.ts';
