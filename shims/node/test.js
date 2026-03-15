import { it } from 'node:test';
import TestContext from '../shared/test-context.js';
import ModuleContext from '../shared/module-context.js';

export default function test(testName, runtimeOptions, testContent) {
  const moduleContext = ModuleContext.lastModule;
  if (!moduleContext) {
    throw new Error(`Test '${testName}' called outside of module context.`);
  }

  const targetRuntimeOptions = testContent ? runtimeOptions : {};
  const targetTestContent = testContent ? testContent : runtimeOptions;
  const context = new TestContext(testName, moduleContext);

  return it(testName, { concurrency: true, ...targetRuntimeOptions }, async function () {
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

