import { it } from 'node:test';
import type Assert from '../shared/assert.ts';
import TestContext from '../shared/test-context.ts';
import ModuleContext from '../shared/module-context.ts';

export default function test(testName: string, testContent: (assert: Assert, meta: { testName: string; options: unknown }) => void | Promise<void>): void;
export default function test(testName: string, runtimeOptions: object, testContent: (assert: Assert, meta: { testName: string; options: unknown }) => void | Promise<void>): void;
export default function test(
  testName: string,
  runtimeOptions: object | ((assert: Assert, meta: { testName: string; options: unknown }) => void | Promise<void>),
  testContent?: (assert: Assert, meta: { testName: string; options: unknown }) => void | Promise<void>,
): void {
  const moduleContext = ModuleContext.lastModule;
  if (!moduleContext) {
    throw new Error(`Test '${testName}' called outside of module context.`);
  }

  const targetRuntimeOptions = testContent ? runtimeOptions as object : {};
  const { skip, todo } = targetRuntimeOptions as { skip?: boolean | string; todo?: boolean | string };

  // skip: no TestContext — finish() would fire "0 assertions" from afterAll otherwise.
  if (skip) {
    it(testName, { skip }, async function () {});
    return;
  }

  const targetTestContent = (testContent ?? runtimeOptions) as (assert: Assert, meta: { testName: string; options: unknown }) => void | Promise<void>;
  const context = new TestContext(testName, moduleContext);

  // Each test gets a fresh plain object inheriting from the module's user context.
  // This matches QUnit's prototype-chain model: before() sets props on the module context,
  // tests inherit them, and each test's own writes don't pollute sibling tests.
  const userContext = Object.create(moduleContext.userContext);
  context.userContext = userContext;

  // todo: exclude from finish() loop — todo tests may have zero or failing assertions.
  // Node's { todo } on it() handles the result; we just prevent afterAll from calling finish().
  if (todo) moduleContext.tests.pop();

  it(testName, { ...targetRuntimeOptions }, async function () {
    for (const module of context.module!.moduleChain) {
      for (const hook of module.beforeEachHooks) {
        await hook.call(userContext, context.assert!);
      }
    }

    const result = await targetTestContent.call(userContext, context.assert!, { testName, options: runtimeOptions });

    await context.assert!.waitForAsyncOps();

    for (let i = context.module!.moduleChain.length - 1; i >= 0; i--) {
      const module = context.module!.moduleChain[i];
      for (let j = module.afterEachHooks.length - 1; j >= 0; j--) {
        await module.afterEachHooks[j]!.call(userContext, context.assert!);
      }
    }

    return result;
  });
}

test.skip = function skipTest(testName: string, _testContent?: unknown): void {
  it(testName, { skip: true }, async function () {});
};

test.todo = function todoTest(testName: string, testContent?: (assert: Assert, meta: { testName: string; options: unknown }) => void | Promise<void>): void {
  if (!testContent) {
    it(testName, { todo: true }, async function () {});
    return;
  }
  test(testName, { todo: true }, testContent);
};
