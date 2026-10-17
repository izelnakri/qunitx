import type { HookFn } from '../types.ts';
import type Assert from './assert.ts';
import TestContext from './test-context.ts';

export default class ModuleContext {
  static Assert: typeof Assert;
  static currentModuleChain: ModuleContext[] = [];
  // Mutated in place: the class itself is frozen once a runtime shim has set it up.
  /** Whether any `only` test or module was declared: from then on, only those run. */
  static focus = { active: false };
  /** `hooks.beforeEach()` / `hooks.afterEach()` callbacks for every test (QUnit.hooks). */
  static globalHooks: { beforeEach: HookFn<Assert>[]; afterEach: HookFn<Assert>[] } = {
    beforeEach: [],
    afterEach: [],
  };

  static get lastModule() {
    const chain = this.currentModuleChain;
    return chain[chain.length - 1];
  }

  name!: string;
  assert!: Assert;
  userContext!: Record<string, unknown>;

  // Internal fallback assert for modules with no direct tests
  testContext = new TestContext();

  moduleChain: ModuleContext[] = [];
  beforeEachHooks: HookFn<Assert>[] = [];
  afterEachHooks: HookFn<Assert>[] = [];
  tests: TestContext[] = [];
  // Tests that will run, in this module and every module nested in it. QUnit runs a
  // module's before/after hooks only when this is non-zero.
  runnableTestCount = 0;
  // Of those, the ones declared with `only` or inside an `only` module.
  focusedTestCount = 0;
  /**
   * Declared with `module.only()` (or `{ only: true }`), or nested in a module that was:
   * every test inside it is focused. Inherited when the module is created.
   */
  focused = false;

  constructor(name: string) {
    const chain = ModuleContext.currentModuleChain;
    const parentModule = chain[chain.length - 1];

    chain.push(this);

    this.moduleChain = chain.slice();
    this.name = parentModule ? `${parentModule.name} > ${name}` : name;
    this.assert = new ModuleContext.Assert(this);
    // Child modules are created inside the parent's callback, after the parent's own
    // `only` was set, so copying it here is enough for any depth.
    this.focused = parentModule?.focused ?? false;

    // User context uses prototype chain from parent module for proper QUnit-style inheritance:
    // a parent before() sets props on its userContext, which child modules inherit; each
    // test then starts from a flat copy of its module's (see createTestUserContext).
    this.userContext = parentModule ? Object.create(parentModule.userContext) : Object.create(null);

    return Object.seal(this);
  }

  /**
   * A fresh context for one test: a copy of every property the module context has,
   * inherited ones included, taken as the test starts (after before hooks ran). The
   * same snapshot QUnit 3 takes, so what one test writes stays out of the next.
   */
  createTestUserContext(): Record<string, unknown> {
    const moduleUserContext = this.userContext;
    const userContext: Record<string, unknown> = {};
    for (const key in moduleUserContext) {
      const value = moduleUserContext[key];
      if (value !== undefined) userContext[key] = value;
    }
    return userContext;
  }

  #eachHooks: { globalCount: number; beforeEach: HookFn<Assert>[]; afterEach: HookFn<Assert>[] } | undefined;

  /**
   * The beforeEach and afterEach hooks a test in this module runs, global ones included,
   * each in the order they run: beforeEach from the outside in, afterEach from the inside
   * out and in reverse. Resolved once per module rather than walked for every test.
   */
  getEachHooks(): { beforeEach: HookFn<Assert>[]; afterEach: HookFn<Assert>[] } {
    const { beforeEach, afterEach } = ModuleContext.globalHooks;
    // Module hooks are all declared before a test runs; global ones can still be added
    // between tests (by a file imported later), but only ever appended.
    const globalCount = beforeEach.length + afterEach.length;
    if (this.#eachHooks?.globalCount !== globalCount) {
      const chain = this.moduleChain;
      this.#eachHooks = {
        globalCount,
        beforeEach: [...beforeEach, ...chain.flatMap((module) => module.beforeEachHooks)],
        afterEach: [...afterEach, ...chain.flatMap((module) => module.afterEachHooks)].reverse(),
      };
    }
    return this.#eachHooks;
  }

  /** Whether a test declared in this module now is focused: `only` itself, or in an `only` module. */
  isFocused(testOnly: boolean): boolean {
    return testOnly || this.focused;
  }

  /** Counts a test that will run towards this module and each module it is nested in. */
  registerRunnableTest(focused = false) {
    for (const module of this.moduleChain) {
      module.runnableTestCount++;
      if (focused) module.focusedTestCount++;
    }
  }

  /**
   * Whether any test in this module or below will run, so its before/after hooks should.
   * Read when the hooks run, once every test is declared and `only` is settled.
   */
  get hasTestsToRun(): boolean {
    return (ModuleContext.focus.active ? this.focusedTestCount : this.runnableTestCount) > 0;
  }

  /**
   * Throws QUnit 3's E0002 error unless this is the module whose callback is running:
   * hooks belong to the module they are declared in, so registering one on a parent
   * module from a child, or from inside a test, is a mistake rather than a late hook.
   */
  assertExecutionIsInsideTestModuleFor(hookName: string) {
    const current = ModuleContext.lastModule;
    if (current !== this) {
      throw new Error(
        `Cannot add ${hookName} hook outside the containing module. Called on "${this.name}", instead of expected "${current?.name ?? ''}". https://qunitjs.com/api/QUnit/module/#E0002`,
      );
    }
  }

  /** Throws QUnit 3's TypeError for an async module callback, before anything is registered. */
  static assertCallbackIsSyncFunction(callback: unknown) {
    if (isAsyncFunction(callback)) throw new TypeError(ASYNC_MODULE_MESSAGE);
  }

  /** Throws the same TypeError when a module callback returned a promise anyway. */
  static assertNotPromise(result: unknown) {
    if (result && typeof (result as { then?: unknown }).then === 'function') {
      throw new TypeError(ASYNC_MODULE_MESSAGE);
    }
  }
}

const ASYNC_MODULE_MESSAGE =
  'QUnit.module() callback must not be async. For async module setup, use hooks. https://qunitjs.com/api/QUnit/module/#hooks';

function isAsyncFunction(fn: unknown): boolean {
  const tag = typeof fn === 'function' && (fn as { [Symbol.toStringTag]?: string })[Symbol.toStringTag];
  return tag === 'AsyncFunction' || tag === 'AsyncGeneratorFunction';
}
