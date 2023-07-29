import { describe, it, before as beforeAll, after as afterAll } from 'node:test';
import Assert from './assert.js';

// NOTE: node.js beforeEach & afterEach is buggy because the TestContext it has is NOT correct reference when called, it gets the last context
// NOTE: QUnit expect() logic is buggy in nested modules
// NOTE: after gets the last direct children test of the module, not last defined context of a module(last defined context is a module)

class TestContext {
  name;

  #module;
  get module() {
    return this.#module;
  }
  set module(value) {
    this.#module = value;
  }

  #assert;
  get assert() {
    return this.#assert;
  }
  set assert(value) {
    this.#assert = value;
  }

  #timeout;
  get timeout() {
    return this.#timeout;
  }
  set timeout(value) {
    this.#timeout = value;
  }

  #steps = [];
  get steps() {
    return this.#steps;
  }
  set steps(value) {
    this.#steps = value;
  }

  #expectedAssertionCount;
  get expectedAssertionCount() {
    return this.#expectedAssertionCount;
  }
  set expectedAssertionCount(value) {
    this.#expectedAssertionCount = value;
  }

  #totalExecutedAssertions = 0;
  get totalExecutedAssertions() {
    return this.#totalExecutedAssertions;
  }
  set totalExecutedAssertions(value) {
    this.#totalExecutedAssertions = value;
  }

  constructor(name, moduleContext) {
    if (moduleContext) {
      this.name = `${moduleContext.name} | ${name}`;
      this.module = moduleContext;
      this.module.tests.push(this);
      this.assert = new Assert(moduleContext, this);
    }
  }

  finish() {
    if (this.totalExecutedAssertions === 0) {
      this.assert.pushResult({
        result: false,
        actual: this.totalExecutedAssertions,
        expected: '> 0',
        message: `Expected at least one assertion to be run for test: ${this.name}`,
      });
    } else if (this.steps.length > 0) {
      this.assert.pushResult({
        result: false,
        actual: this.steps,
        expected: [],
        message: `Expected assert.verifySteps() to be called before end of test after using assert.step(). Unverified steps: ${this.steps.join(', ')}`,
      });
    } else if (this.expectedAssertionCount && this.expectedAssertionCount !== this.totalExecutedAssertions) {
      this.assert.pushResult({
        result: false,
        actual: this.totalExecutedAssertions,
        expected: this.expectedAssertionCount,
        message: `Expected ${this.expectedAssertionCount} assertions, but ${this.totalExecutedAssertions} were run for test: ${this.name}`,
      });
    }
  }
}

class ModuleContext extends TestContext {
  static currentModuleChain = [];

  static get lastModule() {
    return this.currentModuleChain[this.currentModuleChain.length - 1];
  }

  #tests = [];
  get tests() {
    return this.#tests;
  }

  #beforeEachHooks = [];
  get beforeEachHooks() {
    return this.#beforeEachHooks;
  }

  #afterEachHooks = [];
  get afterEachHooks() {
    return this.#afterEachHooks;
  }

  #moduleChain = [];
  get moduleChain() {
    return this.#moduleChain;
  }
  set moduleChain(value) {
    this.#moduleChain = value;
  }

  constructor(name) {
    super(name);

    let parentModule = ModuleContext.currentModuleChain[ModuleContext.currentModuleChain.length - 1];

    ModuleContext.currentModuleChain.push(this);

    this.moduleChain = ModuleContext.currentModuleChain.slice(0);
    this.name = parentModule ? `${parentModule.name} > ${name}` : name;
    this.assert = new Assert(this);
  }
}

export const module = (moduleName, runtimeOptions, moduleContent) => {
  let targetRuntimeOptions = moduleContent ? runtimeOptions : {};
  let targetModuleContent = moduleContent ? moduleContent : runtimeOptions;
  let moduleContext = new ModuleContext(moduleName);

  return describe(moduleName, { concurrency: true, ...targetRuntimeOptions }, async function () {
    let beforeHooks = [];
    let afterHooks = [];

    beforeAll(async function () {
      Object.assign(moduleContext, moduleContext.moduleChain.reduce((result, module) => {
        const { name, ...moduleWithoutName } = module;

        return Object.assign(result, moduleWithoutName, {
          steps: result.steps.concat(module.steps),
          expectedAssertionCount: module.expectedAssertionCount
            ? module.expectedAssertionCount
            : result.expectedAssertionCount
        });
      }, { steps: [], expectedAssertionCount: undefined }));

      for (let hook of beforeHooks) {
        await hook.call(moduleContext, moduleContext.assert);
      }

      moduleContext.tests.forEach((testContext) => {
        const { name, ...moduleContextWithoutName } = moduleContext;

        Object.assign(testContext, moduleContextWithoutName, {
          steps: moduleContext.steps,
          totalExecutedAssertions: moduleContext.totalExecutedAssertions,
          expectedAssertionCount: moduleContext.expectedAssertionCount,
        });
      });
    });
    afterAll(async () => {
      for (const assert of moduleContext.tests.map(testContext => testContext.assert)) {
        await assert.waitForAsyncOps();
      }

      let targetContext = moduleContext.tests[moduleContext.tests.length - 1];
      for (let j = afterHooks.length - 1; j >= 0; j--) {
        await afterHooks[j].call(targetContext, targetContext.assert);
      }

      moduleContext.tests.forEach(testContext => testContext.finish());
    });

    targetModuleContent.call(moduleContext, {
      before(beforeFn) {
        return beforeHooks.push(beforeFn);
      },
      beforeEach(beforeEachFn) {
        return moduleContext.beforeEachHooks.push(beforeEachFn);
      },
      afterEach(afterEachFn) {
        return moduleContext.afterEachHooks.push(afterEachFn);
      },
      after(afterFn) {
        return afterHooks.push(afterFn);
      }
    }, { moduleName, options: runtimeOptions });

    ModuleContext.currentModuleChain.pop();
  });
}

export const test = (testName, runtimeOptions, testContent) => {
  let moduleContext = ModuleContext.lastModule;
  if (!moduleContext) {
    throw new Error(`Test '${testName}' called outside of module context.`);
  }

  let targetRuntimeOptions = testContent ? runtimeOptions : {};
  let targetTestContent = testContent ? testContent : runtimeOptions;
  let context = new TestContext(testName, moduleContext);

  return it(testName, { concurrency: true, ...targetRuntimeOptions }, async function () {
    let result;
    for (let module of context.module.moduleChain) {
      for (let hook of module.beforeEachHooks) {
        await hook.call(context, context.assert);
      }
    }

    result = await targetTestContent.call(context, context.assert, { testName, options: runtimeOptions });

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

export default { module, test, config: {} };
