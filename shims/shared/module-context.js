import TestContext from './test-context.js';

export default class ModuleContext {
  static Assert;
  static currentModuleChain = [];

  static get lastModule() {
    return this.currentModuleChain[this.currentModuleChain.length - 1];
  }

  // Internal fallback assert for modules with no direct tests
  context = new TestContext();

  moduleChain = [];
  beforeEachHooks = [];
  afterEachHooks = [];
  tests = [];

  constructor(name) {
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
