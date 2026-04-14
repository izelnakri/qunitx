import { it } from "jsr:@std/testing/bdd";
import type Assert from '../shared/assert.ts';
import TestContext from '../shared/test-context.ts';
import ModuleContext from '../shared/module-context.ts';
export type { Assert };
export type { PushResultInfo } from '../types.ts';

/**
 * Defines an individual test within a module for Deno's BDD test runner.
 *
 * Wraps `it()` from `@std/testing/bdd` and handles the full QUnit lifecycle:
 * beforeEach/afterEach hooks, async assertion waiting, and step verification.
 *
 * Must be called inside a `module()` callback.
 *
 * @param {string} testName - Name of the test
 * @param {object} [runtimeOptions] - Optional Deno BDD options forwarded to `it()`
 *   (e.g. `{ concurrency: false }`, `{ sanitizeExit: false }`)
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
export default function test(testName: string, testContent: (assert: Assert, meta: { testName: string; options: unknown }) => void | Promise<void>): void;
/** Defines an individual test with optional Deno BDD runtime options forwarded to `it()`. */
export default function test(testName: string, runtimeOptions: object, testContent: (assert: Assert, meta: { testName: string; options: unknown }) => void | Promise<void>): void;
export default function test(
  testName: string,
  runtimeOptions: object | ((assert: Assert, meta: { testName: string; options: unknown }) => void | Promise<void>),
  testContent?: (assert: Assert, meta: { testName: string; options: unknown }) => void | Promise<void>,
): void {
  const moduleContext = ModuleContext.lastModule;
  if (!moduleContext) {
    throw new Error(`Test '${testName}' called outside of module context.`);
  }

  const targetRuntimeOptions = testContent ? runtimeOptions as object : {};
  const { skip } = targetRuntimeOptions as { skip?: boolean | string };

  // If skip is set, register a skipped it() without creating a TestContext (whose
  // finish() would otherwise fire a "0 assertions" failure from afterAll).
  // Deno uses `ignore` instead of `skip`.
  if (skip) {
    it(testName, { ignore: true }, async function () {});
    return;
  }

  const targetTestContent = (testContent ? testContent : runtimeOptions) as (assert: Assert, meta: { testName: string; options: unknown }) => void | Promise<void>;
  const context = new TestContext(testName, moduleContext);

  // Each test gets a fresh plain object inheriting from the module's user context.
  // This matches QUnit's prototype-chain model: before() sets props on the module context,
  // tests inherit them, and each test's own writes don't pollute sibling tests.
  const userContext = Object.create(moduleContext.userContext);
  context.userContext = userContext;

  it(testName, { ...targetRuntimeOptions }, async function () {
    for (const module of context.module!.moduleChain) {
      for (const hook of module.beforeEachHooks) {
        await hook.call(userContext, context.assert!);
      }
    }

    const result = await targetTestContent.call(userContext, context.assert!, { testName, options: runtimeOptions });

    await context.assert!.waitForAsyncOps();

    for (let i = context.module!.moduleChain.length - 1; i >= 0; i--) {
      const module = context.module!.moduleChain[i];
      for (let j = module.afterEachHooks.length - 1; j >= 0; j--) {
        await module.afterEachHooks[j]!.call(userContext, context.assert!);
      }
    }

    return result;
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
