import { describe, beforeAll, afterAll } from "jsr:@std/testing/bdd";
import ModuleContext from '../shared/module-context.js';

// NOTE: node.js beforeEach & afterEach is buggy because the TestContext it has is NOT correct reference when called, it gets the last context
// NOTE: QUnit expect() logic is buggy in nested modules
// NOTE: after gets the last direct children test of the module, not last defined context of a module(last defined context is a module)

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
export default function module(moduleName, runtimeOptions, moduleContent) {
  const targetRuntimeOptions = moduleContent ? runtimeOptions : {};
  const targetModuleContent = moduleContent ? moduleContent : runtimeOptions;
  const moduleContext = new ModuleContext(moduleName);

  describe(moduleName, { concurrency: true, ...targetRuntimeOptions }, function () {
    const beforeHooks = [];
    const afterHooks = [];

    beforeAll(async function () {
      Object.assign(moduleContext.context, moduleContext.moduleChain.reduce((result, module) => {
        return Object.assign(result, module.context, {
          steps: result.steps.concat(module.context.steps),
          expectedAssertionCount: module.context.expectedAssertionCount
            ? module.context.expectedAssertionCount
            : result.expectedAssertionCount
        });
      }, { steps: [], expectedAssertionCount: undefined }));

      for (const hook of beforeHooks) {
        await hook.call(moduleContext.context, moduleContext.assert);
      }

      for (let i = 0, len = moduleContext.tests.length; i < len; i++) {
        Object.assign(moduleContext.tests[i], moduleContext.context, {
          steps: moduleContext.context.steps,
          totalExecutedAssertions: moduleContext.context.totalExecutedAssertions,
          expectedAssertionCount: moduleContext.context.expectedAssertionCount,
        });
      }
    });
    afterAll(async () => {
      for (const assert of moduleContext.tests.map(testContext => testContext.assert)) {
        await assert.waitForAsyncOps();
      }

      const targetContext = moduleContext.tests[moduleContext.tests.length - 1];
      for (let j = afterHooks.length - 1; j >= 0; j--) {
        await afterHooks[j].call(targetContext, targetContext.assert);
      }

      for (let i = 0, len = moduleContext.tests.length; i < len; i++) {
        moduleContext.tests[i].finish();
      }
    });

    targetModuleContent.call(moduleContext.context, {
      before(beforeFn) {
        beforeHooks[beforeHooks.length] = beforeFn;
      },
      beforeEach(beforeEachFn) {
        moduleContext.beforeEachHooks[moduleContext.beforeEachHooks.length] = beforeEachFn;
      },
      afterEach(afterEachFn) {
        moduleContext.afterEachHooks[moduleContext.afterEachHooks.length] = afterEachFn;
      },
      after(afterFn) {
        afterHooks[afterHooks.length] = afterFn;
      }
    }, { moduleName, options: runtimeOptions });

    ModuleContext.currentModuleChain.pop();
  });
}
