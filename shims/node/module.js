import { describe, before as beforeAll, after as afterAll } from 'node:test';
import ModuleContext from '../shared/module-context.js';

export default function module(moduleName, runtimeOptions, moduleContent) {
  const targetRuntimeOptions = moduleContent ? runtimeOptions : {};
  const targetModuleContent = moduleContent ? moduleContent : runtimeOptions;
  const moduleContext = new ModuleContext(moduleName);

  return describe(moduleName, { ...targetRuntimeOptions }, function () {
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
