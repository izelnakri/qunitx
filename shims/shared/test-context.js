export default class TestContext {
  static Assert;

  #name;
  get name() {
    return this.#name;
  }
  set name(value) {
    this.#name = value;
  }

  #module;
  get module() {
    return this.#module;
  }
  set module(value) {
    this.#module = value;
  }

  #asyncOps = [];
  get asyncOps() {
    return this.#asyncOps;
  }
  set asyncOps(value) {
    this.#asyncOps = value;
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
      this.assert = new TestContext.Assert(moduleContext, this);
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

