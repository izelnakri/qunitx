import { afterAll, beforeAll, describe } from 'jsr:@std/testing@^1.0.17/bdd';
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
function module(moduleName: string, moduleContent: (hooks: HooksObject<Assert>, meta: { moduleName: string; options: unknown; context: Record<string, unknown> }) => void): void;
/** Defines a test module (suite) with optional Deno BDD runtime options forwarded to `describe()`. */
function module(moduleName: string, runtimeOptions: object, moduleContent: (hooks: HooksObject<Assert>, meta: { moduleName: string; options: unknown; context: Record<string, unknown> }) => void): void;
function module(
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

  const targetModuleContent = (moduleContent ?? runtimeOptions) as (hooks: HooksObject<Assert>, meta: { moduleName: string; options: unknown }) => unknown;
  // Before the ModuleContext exists: its constructor pushes to currentModuleChain.
  ModuleContext.assertCallbackIsSyncFunction(targetModuleContent);
  const moduleContext = new ModuleContext(moduleName);

  describe(moduleName, { ...targetRuntimeOptions }, function () {
    const beforeHooks: HookFn<Assert>[] = [];
    const afterHooks: HookFn<Assert>[] = [];

    // before/after hooks run with the module's own context, as in QUnit 3: what a
    // before() sets is inherited by every test, and after() sees only module state,
    // never what the last test wrote to its own context.
    const userContext = moduleContext.userContext;
    const hookMeta = { context: userContext };

    beforeAll(async () => {
      // Skipped when every test in the module is (QUnit runs before on the first test).
      if (moduleContext.runnableTestCount === 0) return;
      // before() assertions are attributed to the first direct test only (matching QUnit's model).
      const firstTest = moduleContext.tests[0];
      const beforeAssert = firstTest ? firstTest.assert! : moduleContext.assert!;

      for (const hook of beforeHooks) {
        await hook.call(userContext, beforeAssert, hookMeta);
        await beforeAssert.waitForAsyncOps();
      }
    });

    afterAll(async () => {
      const allAsyncOps = moduleContext.tests.flatMap((t) => t.asyncOps);
      if (allAsyncOps.length > 0) await Promise.all(allAsyncOps);

      if (moduleContext.runnableTestCount > 0) {
        const tests = moduleContext.tests;
        const lastTest = tests[tests.length - 1];
        const afterAssert = lastTest ? lastTest.assert! : moduleContext.assert!;
        // Indexed reverse iteration avoids `afterHooks.toReversed()`'s per-call alloc.
        for (let i = afterHooks.length - 1; i >= 0; i--) {
          await afterHooks[i]!.call(userContext, afterAssert, hookMeta);
          await afterAssert.waitForAsyncOps();
        }
      }

      for (const testCtx of moduleContext.tests) {
        testCtx.finish();
      }
    });

    try {
      ModuleContext.assertNotPromise(targetModuleContent.call(userContext, {
        before(beforeFn) {
          moduleContext.assertExecutionIsInsideTestModuleFor('before');
          beforeHooks.push(beforeFn);
        },
        beforeEach(beforeEachFn) {
          moduleContext.assertExecutionIsInsideTestModuleFor('beforeEach');
          moduleContext.beforeEachHooks.push(beforeEachFn);
        },
        afterEach(afterEachFn) {
          moduleContext.assertExecutionIsInsideTestModuleFor('afterEach');
          moduleContext.afterEachHooks.push(afterEachFn);
        },
        after(afterFn) {
          moduleContext.assertExecutionIsInsideTestModuleFor('after');
          afterHooks.push(afterFn);
        }
      }, { moduleName, options: targetRuntimeOptions, context: userContext }));
    } finally {
      // Even when the callback throws, so the modules declared after it nest correctly.
      ModuleContext.currentModuleChain.pop();
    }
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

// Exported here rather than on the declarations above: `export default function` on an
// overload set that also carries a namespace merge (.skip/.todo) emits a .d.ts with two
// `export default` statements, which is invalid TypeScript (TS2528/TS2652/TS2383) and
// breaks consumers that typecheck with `skipLibCheck: false`.
export default module;

export type { Assert };
export type { HookFn, HooksObject, PushResultInfo } from '../types.ts';
