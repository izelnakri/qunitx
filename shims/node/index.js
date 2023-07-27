import { run, describe, it, before as _before, after as _after, beforeEach as _beforeEach, afterEach as _afterEach } from 'node:test';
import Assert, { AssertionError } from './assert.js';

class TestContext {
  assert;
  name;
  timeout;
  steps = [];
  expectedAssertionCount;
  totalExecutedAssertions = 0;

  constructor(name, moduleContext) {
    this.name = `${ModuleContext.moduleChain.map((module) => module.name).join(' | ')}}${name}`;
    this.module = moduleContext;
    this.module.tests.push(this);
    this.assert = new Assert(moduleContext, this);
  }

  complete() {
    // TODO: below should only work if moduleChain is one level deep
    // if (this.totalExecutedAssertions === 0) {
    //   this.assert.pushResult({
    //     result: false,
    //     actual: this.totalExecutedAssertions,
    //     expected: '> 0',
    //     message: `Expected at least one assertion to be run for test: ${this.name}`,
    //   });
    // } else

    if (this.steps.length > 0) {
      this.assert.pushResult({
        result: false,
        actual: this.steps,
        expected: [],
        message: `Expected assert.verifySteps() to be called before end of test after using assert.step(). Unverified steps: ${this.steps.join(', ')}`
      });
    }

    // TODO: how to build this for nested modules(?)
    // if (this.expectedAssertionCount && this.expectedAssertionCount !== this.totalExecutedAssertions) {
    //   this.assert.pushResult({
    //     result: false,
    //     actual: this.totalExecutedAssertions,
    //     expected: this.expectedAssertionCount,
    //     message: `Expected ${this.expectedAssertionCount} assertions, but ${this.totalExecutedAssertions} were run for test: ${this.name}`
    //   });
    // }
  }
}

class ModuleContext {
  static moduleChain = [];

  static get current() {
    return this.moduleChain[this.moduleChain.length - 1] || null;
  }

  #tests = [];
  get tests() {
    return this.#tests;
  }

  constructor(name) {
    this.name = name;
    ModuleContext.moduleChain.push(this);
  }
}

export const module = async function(moduleName, runtimeOptions, moduleContent) {
  let targetRuntimeOptions = moduleContent ? runtimeOptions : {};
  let targetModuleContent = moduleContent ? moduleContent : runtimeOptions;

  const moduleContext = new ModuleContext(moduleName);

  return describe(moduleName, assignDefaultValues(targetRuntimeOptions, { concurrency: true }), async function () {
    let afterHooks = [];
    let assert;
    let userProvidedModuleContent = targetModuleContent({
      _context: moduleContext,
      before(beforeFn) {
        return _before(async function () {
          assert = assert || new Assert(moduleContext);
          return await beforeFn.call(moduleContext, assert);
        });
      },
      beforeEach(beforeEachFn) {
        let i = 0;
        return _beforeEach(async function () {
          return await beforeEachFn.call(moduleContext, moduleContext.tests[i++].assert);
        });
      },
      afterEach(afterEachFn) {
        let i = 0;
        return _afterEach(async function () {
          return await afterEachFn.call(moduleContext, moduleContext.tests[i++].assert);
        });
      },
      after(afterFn) {
        assert = assert || new Assert(moduleContext);
        afterHooks.push(afterFn); // Save user-provided hooks

        return _after(async function () {
          for (const assert of moduleContext.tests.map(testContext => testContext.assert)) {
            await assert.waitForAsyncOps();
          }

          for (let hook of afterHooks) {
            let result = await hook.call(moduleContext, assert);
          }

          moduleContext.tests.forEach(testContext => testContext.complete());
        });
      }
    }, { moduleName, options: runtimeOptions });

    ModuleContext.moduleChain.pop();

    let result = await userProvidedModuleContent;

    if (afterHooks.length === 0) {
      await _after(async () => {
        for (const assert of moduleContext.tests.map(testContext => testContext.assert)) {
          await assert.waitForAsyncOps();
        }

        return moduleContext.tests.forEach(testContext => testContext.complete());
      });
    }

    return result;
  });
}

export const test = async function(testName, runtimeOptions, testContent) {
  const moduleContext = ModuleContext.current;
  if (!moduleContext) {
    throw new Error(`Test '${testName}' called outside of module context.`);
  }

  let targetRuntimeOptions = testContent ? runtimeOptions : {};
  let targetTestContent = testContent ? testContent : runtimeOptions;

  const testContext = new TestContext(testName, moduleContext);

  return it(testName, assignDefaultValues(targetRuntimeOptions, { concurrency: true }), async function () {
    let result;
    try {
      result = await targetTestContent.call(moduleContext, testContext.assert, { testName, options: runtimeOptions });

      await testContext.assert.waitForAsyncOps();
    } catch (error) {
      throw error;
    } finally {
      // testContext.complete();
    }

    console.log('test() call finish');
    return result;
  });
}

function assignDefaultValues(options, defaultValues) {
  for (let key in defaultValues) {
    if (options[key] === undefined) {
      options[key] = defaultValues[key];
    }
  }

  return options;
}

export default { module, test, config: {} };
