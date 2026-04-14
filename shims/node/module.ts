import { describe, before as beforeAll, after as afterAll } from 'node:test';
import type Assert from '../shared/assert.ts';
import type { HookFn, HooksObject } from '../types.ts';
import ModuleContext from '../shared/module-context.ts';

/**
 * Defines a test module (suite) for Node's built-in test runner.
 *
 * Wraps `describe()` from `node:test` and sets up the QUnit lifecycle
 * (before/beforeEach/afterEach/after hooks, assertion counting, steps tracking).
 *
 * @param {string} moduleName - Name of the test suite.
 * @param {object} [runtimeOptions] - Optional Node test runner options forwarded to `describe()`
 *   (e.g. `{ concurrency: true }`, `{ timeout: 5000 }`). Use `{ skip: true | string }` to skip
 *   the entire module.
 * @param {function} moduleContent - Callback that defines tests and hooks via `hooks.before`,
 *   `hooks.beforeEach`, `hooks.afterEach`, `hooks.after`.
 *   Receives `(hooks, { moduleName, options, context })`.
 *   `context` is the shared module environment — the same object as `this` in
 *   regular-function callbacks, useful when using arrow functions.
 * @returns {void}
 * @example
 * ```js
 * import { module, test } from "qunitx";
 *
 * module("Math", (hooks, { context }) => {
 *   context.multiplier = 2;
 *
 *   hooks.beforeEach((assert, { context }) => {
 *     context.value = 21;
 *   });
 *
 *   test("multiplication", (assert, { context }) => {
 *     assert.equal(context.value * context.multiplier, 42);
 *   });
 * });
 * ```
 */
export default function module(moduleName: string, moduleContent: (hooks: HooksObject<Assert>, meta: { moduleName: string; options: unknown; context: Record<string, unknown> }) => void): void;
/** Defines a test module (suite) with optional Node test runner options forwarded to `describe()`. */
export default function module(moduleName: string, runtimeOptions: object, moduleContent: (hooks: HooksObject<Assert>, meta: { moduleName: string; options: unknown; context: Record<string, unknown> }) => void): void;
export default function module(
  moduleName: string,
  runtimeOptions: object | ((hooks: HooksObject<Assert>) => void),
  moduleContent?: (hooks: HooksObject<Assert>, meta: { moduleName: string; options: unknown; context: Record<string, unknown> }) => void,
): void {
  const targetRuntimeOptions = moduleContent ? runtimeOptions as object : {};
  const { skip } = targetRuntimeOptions as { skip?: boolean | string };

  // If skip is set, register a skipped describe() without creating a ModuleContext.
  // The ModuleContext constructor pushes to currentModuleChain; the matching pop()
  // lives inside the describe callback. If the runtime skips the callback, the pop
  // never runs and corrupts the chain for all subsequent modules.
  if (skip) {
    describe(moduleName, { skip }, function () {});
    return;
  }

  const targetModuleContent = (moduleContent ? moduleContent : runtimeOptions) as (hooks: HooksObject<Assert>, meta: { moduleName: string; options: unknown }) => void;
  const moduleContext = new ModuleContext(moduleName);

  describe(moduleName, { ...targetRuntimeOptions }, function () {
    const beforeHooks: HookFn<Assert>[] = [];
    const afterHooks: HookFn<Assert>[] = [];

    beforeAll(async function () {
      // before() assertions are attributed to the first direct test only (matching QUnit's model).
      // Tests inherit parent context via prototype chain, so no Object.assign needed.
      const firstTest = moduleContext.tests[0];
      const beforeAssert = firstTest ? firstTest.assert! : moduleContext.assert!;

      for (const hook of beforeHooks) {
        await hook.call(moduleContext.userContext, beforeAssert, { context: moduleContext.userContext });
      }
    });

    afterAll(async () => {
      for (const testContext of moduleContext.tests) {
        await testContext.assert!.waitForAsyncOps();
      }

      const lastTest = moduleContext.tests[moduleContext.tests.length - 1];
      if (lastTest) {
        for (let j = afterHooks.length - 1; j >= 0; j--) {
          await afterHooks[j]!.call(lastTest.userContext, lastTest.assert!, { context: lastTest.userContext });
        }
      }

      for (let i = 0, len = moduleContext.tests.length; i < len; i++) {
        moduleContext.tests[i].finish();
      }
    });

    targetModuleContent.call(moduleContext.userContext, {
      before(beforeFn) {
        beforeHooks.push(beforeFn);
      },
      beforeEach(beforeEachFn) {
        moduleContext.beforeEachHooks.push(beforeEachFn);
      },
      afterEach(afterEachFn) {
        moduleContext.afterEachHooks.push(afterEachFn);
      },
      after(afterFn) {
        afterHooks.push(afterFn);
      }
    }, { moduleName, options: runtimeOptions, context: moduleContext.userContext });

    ModuleContext.currentModuleChain.pop();
  });
}

/**
 * Skips all tests inside a module. Equivalent to `QUnit.module.skip`.
 * The module is registered as skipped by Node's runner; no test bodies run.
 *
 * @param {string} moduleName - Name of the module to skip.
 * @param {function} [_moduleContent] - Optional body (ignored — no tests run).
 * @example
 * ```js
 * import { module, test } from "qunitx";
 *
 * module.skip("Math — not yet implemented", () => {
 *   test("addition", (assert) => {
 *     assert.equal(1 + 1, 2);
 *   });
 * });
 * ```
 */
module.skip = function skipModule(moduleName: string, _moduleContent?: unknown): void {
  describe(moduleName, { skip: true }, function () {});
};
