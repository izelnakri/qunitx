import { it } from "https://deno.land/std@0.192.0/testing/bdd.ts";
import TestContext from '../shared/test-context.js';
import ModuleContext from '../shared/module-context.js';

export default function test(testName, runtimeOptions, testContent) {
  let moduleContext = ModuleContext.lastModule;
  if (!moduleContext) {
    throw new Error(`Test '${testName}' called outside of module context.`);
  }

  let targetRuntimeOptions = testContent ? runtimeOptions : {};
  let targetTestContent = testContent ? testContent : runtimeOptions;
  let context = new TestContext(testName, moduleContext);

  return it(testName, { concurrency: true, ...targetRuntimeOptions }, async function () {
    for (let module of context.module.moduleChain) {
      for (let hook of module.beforeEachHooks) {
        await hook.call(context, context.assert);
      }
    }

    let result = await targetTestContent.call(context, context.assert, { testName, options: runtimeOptions });

    await context.assert.waitForAsyncOps();

    for (let i = context.module.moduleChain.length - 1; i >= 0; i--) {
      let module = context.module.moduleChain[i];
      for (let j = module.afterEachHooks.length - 1; j >= 0; j--) {
        await module.afterEachHooks[j].call(context, context.assert);
      }
    }

    return result;
  });
}

