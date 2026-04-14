import { describe, beforeAll, afterAll } from "jsr:@std/testing/bdd";
import type Assert from '../shared/assert.ts';
import type { HooksObject } from '../types.ts';
import ModuleContext from '../shared/module-context.ts';
export type { Assert };
export type { HookFn, HooksObject, PushResultInfo } from '../types.ts';

/**
 * Defines a test module (suite) for Deno's BDD test runner.
 *
 * Wraps `describe()` from `@std/testing/bdd` and sets up the QUnit lifecycle
 * (before/beforeEach/afterEach/after hooks, assertion counting, steps tracking).
 *
 * @param {string} moduleName - Name of the test suite
 * @param {object} [runtimeOptions] - Optional Deno BDD options forwarded to `describe()`
 *   (e.g. `{ concurrency: false }`, `{ permissions: { read: true } }`)
 * @param {function} moduleContent - Callback that defines tests and hooks via `hooks.before`,
 *   `hooks.beforeEach`, `hooks.afterEach`, `hooks.after`
 * @returns {void}
 * @example
 * ```js ignore
 * import { module, test } from "qunitx";
 *
 * module("Math", (hooks) => {
 *   hooks.before((assert) => {
 *     assert.step("before hook ran");
 *   });
 *
 *   test("addition", (assert) => {
 *     assert.equal(2 + 2, 4);
 *   });
 * });
 * ```
 */
export default function module(moduleName: string, moduleContent: (hooks: HooksObject<Assert>, meta: { moduleName: string; options: unknown }) => void): void;
/** Defines a test module (suite) with optional Deno BDD runtime options forwarded to `describe()`. */
export default function module(moduleName: string, runtimeOptions: object, moduleContent: (hooks: HooksObject<Assert>, meta: { moduleName: string; options: unknown }) => void): void;
export default function module(
  moduleName: string,
  runtimeOptions: object | ((hooks: HooksObject<Assert>) => void),
  moduleContent?: (hooks: HooksObject<Assert>, meta: { moduleName: string; options: unknown }) => void,
): void {
  const targetRuntimeOptions = moduleContent ? runtimeOptions as object : {};
  const { skip } = targetRuntimeOptions as { skip?: boolean | string };

  // If skip is set, register a skipped describe() without creating a ModuleContext.
  // The ModuleContext constructor pushes to currentModuleChain; the matching pop()
  // lives inside the describe callback. If the runtime skips the callback, the pop
  // never runs and corrupts the chain for all subsequent modules.
  // Deno uses `ignore` instead of `skip`.
  if (skip) {
    describe(moduleName, { ignore: true }, function () {});
    return;
  }

  const targetModuleContent = (moduleContent ? moduleContent : runtimeOptions) as (hooks: HooksObject<Assert>, meta: { moduleName: string; options: unknown }) => void;
  const moduleContext = new ModuleContext(moduleName);

  describe(moduleName, { ...targetRuntimeOptions }, function () {
    const beforeHooks: ((assert: Assert) => void | Promise<void>)[] = [];
    const afterHooks: ((assert: Assert) => void | Promise<void>)[] = [];

    beforeAll(async function () {
      // before() assertions are attributed to the first direct test only (matching QUnit's model).
      // Tests inherit parent context via prototype chain, so no Object.assign needed.
      const firstTest = moduleContext.tests[0];
      const beforeAssert = firstTest ? firstTest.assert! : moduleContext.assert!;

      for (const hook of beforeHooks) {
        await hook.call(moduleContext.userContext, beforeAssert);
      }
    });

    afterAll(async () => {
      for (const testContext of moduleContext.tests) {
        await testContext.assert!.waitForAsyncOps();
      }

      const lastTest = moduleContext.tests[moduleContext.tests.length - 1];
      if (lastTest) {
        for (let j = afterHooks.length - 1; j >= 0; j--) {
          await afterHooks[j]!.call(lastTest.userContext, lastTest.assert!);
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
    }, { moduleName, options: runtimeOptions });

    ModuleContext.currentModuleChain.pop();
  });
}

/**
 * Skips all tests inside a module. Equivalent to `QUnit.module.skip`.
 * The module is registered as ignored by Deno's runner; no test bodies run.
 *
 * @param {string} moduleName - Name of the module to skip.
 * @param {function} [_moduleContent] - Optional body (ignored — no tests run).
 * @example
 * ```js ignore
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
  describe(moduleName, { ignore: true }, function () {});
};
