import type { HookFn } from '../types.ts';
import type Assert from './assert.ts';
import TestContext from './test-context.ts';

export default class ModuleContext {
  static Assert: typeof Assert;
  static currentModuleChain: ModuleContext[] = [];

  static get lastModule() {
    return this.currentModuleChain.at(-1);
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

  constructor(name: string) {
    const parentModule = ModuleContext.currentModuleChain.at(-1);

    ModuleContext.currentModuleChain.push(this);

    this.moduleChain = [...ModuleContext.currentModuleChain];
    this.name = parentModule ? `${parentModule.name} > ${name}` : name;
    this.assert = new ModuleContext.Assert(this);

    // User context uses prototype chain from parent module for proper QUnit-style inheritance:
    // parent before() sets props on parent userContext, child tests inherit via prototype.
    this.userContext = parentModule ? Object.create(parentModule.userContext) : Object.create(null);

    return Object.freeze(this);
  }
}
