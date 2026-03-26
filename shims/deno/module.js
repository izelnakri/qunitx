import { describe, beforeAll, afterAll } from "jsr:@std/testing/bdd";
import ModuleContext from '../shared/module-context.js';

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

  describe(moduleName, { ...targetRuntimeOptions }, function () {
    const beforeHooks = [];
    const afterHooks = [];

    beforeAll(async function () {
      // before() assertions are attributed to the first direct test only (matching QUnit's model).
      // Tests inherit parent context via prototype chain, so no Object.assign needed.
      const firstTest = moduleContext.tests[0];
      const beforeAssert = firstTest ? firstTest.assert : moduleContext.assert;

      for (const hook of beforeHooks) {
        await hook.call(moduleContext.userContext, beforeAssert);
      }
    });

    afterAll(async () => {
      for (const testContext of moduleContext.tests) {
        await testContext.assert.waitForAsyncOps();
      }

      const lastTest = moduleContext.tests[moduleContext.tests.length - 1];
      if (lastTest) {
        for (let j = afterHooks.length - 1; j >= 0; j--) {
          await afterHooks[j].call(lastTest.userContext, lastTest.assert);
        }
      }

      for (let i = 0, len = moduleContext.tests.length; i < len; i++) {
        moduleContext.tests[i].finish();
      }
    });

    targetModuleContent.call(moduleContext.userContext, {
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
