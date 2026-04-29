import { after as afterAll, before as beforeAll, describe } from 'node:test';
import type Assert from '../shared/assert.ts';
import ModuleContext from '../shared/module-context.ts';
import type { HookFn, HooksObject } from '../types.ts';
import { callAtLocation, captureCallerLocation } from './caller-location.ts';

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
  const loc = captureCallerLocation(module);
  const targetRuntimeOptions = moduleContent ? runtimeOptions as object : {};
  const { skip } = targetRuntimeOptions as { skip?: boolean | string };

  // If skip is set, register a skipped describe() without creating a ModuleContext.
  // The ModuleContext constructor pushes to currentModuleChain; the matching pop()
  // lives inside the describe callback. If the runtime skips the callback, the pop
  // never runs and corrupts the chain for all subsequent modules.
  if (skip) {
    callAtLocation(describe, loc, moduleName, { skip }, function () {});
    return;
  }

  const targetModuleContent = (moduleContent ?? runtimeOptions) as (hooks: HooksObject<Assert>, meta: { moduleName: string; options: unknown }) => void;
  const moduleContext = new ModuleContext(moduleName);

  callAtLocation(describe, loc, moduleName, { ...targetRuntimeOptions }, function () {
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

      const tests = moduleContext.tests;
      const lastTest = tests[tests.length - 1];
      if (lastTest) {
        // Indexed reverse iteration avoids `afterHooks.toReversed()`'s per-call alloc.
        for (let i = afterHooks.length - 1; i >= 0; i--) {
          await afterHooks[i]!.call(lastTest.userContext, lastTest.assert!, { context: lastTest.userContext });
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
  callAtLocation(describe, captureCallerLocation(skipModule), moduleName, { skip: true }, function () {});
};

/**
 * Marks all tests inside a module as todo. Equivalent to `QUnit.module.todo`.
 * The module is registered as skipped by Node's runner; no test bodies run.
 * Node has no native "todo module" concept, so this maps to skip.
 *
 * @param {string} moduleName - Name of the module to mark as todo.
 * @param {function} [_moduleContent] - Optional body (ignored — no tests run).
 * @example
 * ```js
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
  callAtLocation(describe, captureCallerLocation(todoModule), moduleName, { skip: true }, function () {});
};
