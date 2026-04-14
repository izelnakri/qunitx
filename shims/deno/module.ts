import { afterAll, beforeAll, describe } from 'jsr:@std/testing/bdd';
import type Assert from '../shared/assert.ts';
import ModuleContext from '../shared/module-context.ts';
import type { HookFn, HooksObject } from '../types.ts';

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
export default function module(moduleName: string, moduleContent: (hooks: HooksObject<Assert>, meta: { moduleName: string; options: unknown; context: Record<string, unknown> }) => void): void;
/** Defines a test module (suite) with optional Deno BDD runtime options forwarded to `describe()`. */
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
  // Deno uses `ignore` instead of `skip`.
  if (skip) {
    describe(moduleName, { ignore: true }, function () {});
    return;
  }

  const targetModuleContent = (moduleContent ?? runtimeOptions) as (hooks: HooksObject<Assert>, meta: { moduleName: string; options: unknown }) => void;
  const moduleContext = new ModuleContext(moduleName);

  describe(moduleName, { ...targetRuntimeOptions }, function () {
    const beforeHooks: HookFn<Assert>[] = [];
    const afterHooks: HookFn<Assert>[] = [];

    beforeAll(async () => {
      // before() assertions are attributed to the first direct test only (matching QUnit's model).
      // Tests inherit parent context via prototype chain, so no Object.assign needed.
      const firstTest = moduleContext.tests[0];
      const beforeAssert = firstTest ? firstTest.assert! : moduleContext.assert!;

      for (const hook of beforeHooks) {
        await hook.call(moduleContext.userContext, beforeAssert, { context: moduleContext.userContext });
      }
    });

    afterAll(async () => {
      const allAsyncOps = moduleContext.tests.flatMap((t) => t.asyncOps);
      if (allAsyncOps.length > 0) await Promise.all(allAsyncOps);

      const lastTest = moduleContext.tests.at(-1);
      if (lastTest) {
        for (const hook of afterHooks.toReversed()) {
          await hook.call(lastTest.userContext, lastTest.assert!, { context: lastTest.userContext });
        }
      }

      for (const testCtx of moduleContext.tests) {
        testCtx.finish();
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
    }, { moduleName, options: targetRuntimeOptions, context: moduleContext.userContext });

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

/**
 * Marks all tests inside a module as todo. Equivalent to `QUnit.module.todo`.
 * The module is registered as ignored by Deno's runner; no test bodies run.
 * Deno has no native "todo module" concept, so this maps to ignore.
 *
 * @param {string} moduleName - Name of the module to mark as todo.
 * @param {function} [_moduleContent] - Optional body (ignored — no tests run).
 * @example
 * ```js ignore
 * import { module, test } from "qunitx";
 *
 * module.todo("Math — not yet implemented", () => {
 *   test("addition", (assert) => {
 *     assert.equal(1 + 1, 2);
 *   });
 * });
 * ```
 */
module.todo = function todoModule(moduleName: string, _moduleContent?: unknown): void {
  describe(moduleName, { ignore: true }, function () {});
};

export type { Assert };
export type { HookFn, HooksObject, PushResultInfo } from '../types.ts';
