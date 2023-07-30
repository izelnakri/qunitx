import TestContext from './test-context.js';

export default class ModuleContext {
  static Assert;
  static currentModuleChain = [];

  static get lastModule() {
    return this.currentModuleChain[this.currentModuleChain.length - 1];
  }

  context = new TestContext();

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
    let parentModule = ModuleContext.currentModuleChain[ModuleContext.currentModuleChain.length - 1];

    ModuleContext.currentModuleChain.push(this);

    this.moduleChain = ModuleContext.currentModuleChain.slice(0);
    this.name = parentModule ? `${parentModule.name} > ${name}` : name;
    this.assert = new ModuleContext.Assert(this);
  }
}
