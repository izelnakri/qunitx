import { it } from "jsr:@std/testing/bdd";
import TestContext from '../shared/test-context.js';
import ModuleContext from '../shared/module-context.js';

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
export default function test(testName, runtimeOptions, testContent) {
  const moduleContext = ModuleContext.lastModule;
  if (!moduleContext) {
    throw new Error(`Test '${testName}' called outside of module context.`);
  }

  const targetRuntimeOptions = testContent ? runtimeOptions : {};
  const targetTestContent = testContent ? testContent : runtimeOptions;
  const context = new TestContext(testName, moduleContext);

  it(testName, { concurrency: true, ...targetRuntimeOptions }, async function () {
    for (const module of context.module.moduleChain) {
      for (const hook of module.beforeEachHooks) {
        await hook.call(context, context.assert);
      }
    }

    const result = await targetTestContent.call(context, context.assert, { testName, options: runtimeOptions });

    await context.assert.waitForAsyncOps();

    for (let i = context.module.moduleChain.length - 1; i >= 0; i--) {
      const module = context.module.moduleChain[i];
      for (let j = module.afterEachHooks.length - 1; j >= 0; j--) {
        await module.afterEachHooks[j].call(context, context.assert);
      }
    }

    return result;
  });
}

