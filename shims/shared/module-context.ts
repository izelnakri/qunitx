import type Assert from './assert.ts';
import type { HookFn } from '../types.ts';
import TestContext from './test-context.ts';

export default class ModuleContext {
  static Assert: typeof Assert;
  static currentModuleChain: ModuleContext[] = [];

  static get lastModule() {
    return this.currentModuleChain[this.currentModuleChain.length - 1];
  }

  name!: string;
  assert!: Assert;
  userContext!: object;

  // Internal fallback assert for modules with no direct tests
  context = new TestContext();

  moduleChain: ModuleContext[] = [];
  beforeEachHooks: HookFn<Assert>[] = [];
  afterEachHooks: HookFn<Assert>[] = [];
  tests: TestContext[] = [];

  constructor(name: string) {
    const parentModule = ModuleContext.currentModuleChain[ModuleContext.currentModuleChain.length - 1];

    ModuleContext.currentModuleChain.push(this);

    this.moduleChain = ModuleContext.currentModuleChain.slice(0);
    this.name = parentModule ? `${parentModule.name} > ${name}` : name;
    this.assert = new ModuleContext.Assert(this);

    // User context uses prototype chain from parent module for proper QUnit-style inheritance:
    // parent before() sets props on parent userContext, child tests inherit via prototype.
    this.userContext = parentModule ? Object.create(parentModule.userContext) : Object.create(null);

    return Object.freeze(this);
  }
}
