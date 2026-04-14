import type Assert from './assert.ts';
import type ModuleContext from './module-context.ts';

export default class TestContext {
  static Assert: typeof Assert;

  #name: string | undefined;
  get name() {
    return this.#name;
  }
  set name(value) {
    this.#name = value;
  }

  #module: ModuleContext | undefined;
  get module() {
    return this.#module;
  }
  set module(value) {
    this.#module = value;
  }

  #asyncOps: Promise<void>[] = [];
  get asyncOps() {
    return this.#asyncOps;
  }
  set asyncOps(value) {
    this.#asyncOps = value;
  }

  #assert: Assert | undefined;
  get assert() {
    return this.#assert;
  }
  set assert(value) {
    this.#assert = value;
  }

  #timeout: number | undefined;
  get timeout() {
    return this.#timeout;
  }
  set timeout(value) {
    this.#timeout = value;
  }

  rejectTimeout: ((err: Error) => void) | undefined;
  #timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  #timedOut = false;

  setTimeoutDuration(ms: number) {
    if (this.#timeoutHandle !== undefined) {
      clearTimeout(this.#timeoutHandle);
      this.#timeoutHandle = undefined;
    }
    if (!this.rejectTimeout) return;
    this.#timeoutHandle = setTimeout(() => {
      this.#timedOut = true;
      this.rejectTimeout!(new Error(`Test timed out after ${ms}ms`));
    }, ms);
  }

  clearTimeoutHandle() {
    if (this.#timeoutHandle !== undefined) {
      clearTimeout(this.#timeoutHandle);
      this.#timeoutHandle = undefined;
    }
  }

  #steps: string[] = [];
  get steps() {
    return this.#steps;
  }
  set steps(value) {
    this.#steps = value;
  }

  #expectedAssertionCount: number | undefined;
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

  userContext: Record<string, unknown> = {};

  constructor(name?: string, moduleContext?: ModuleContext) {
    if (moduleContext) {
      this.name = `${moduleContext.name} | ${name}`;
      this.module = moduleContext;
      this.module.tests.push(this);
      this.assert = new TestContext.Assert(moduleContext, this);
    }
  }

  finish() {
    if (this.#timedOut) return;
    if (this.totalExecutedAssertions === 0) {
      this.assert!.pushResult({
        result: false,
        actual: this.totalExecutedAssertions,
        expected: '> 0',
        message: `Expected at least one assertion to be run for test: ${this.name}`,
      });
    } else if (this.steps.length > 0) {
      this.assert!.pushResult({
        result: false,
        actual: this.steps,
        expected: [],
        message: `Expected assert.verifySteps() to be called before end of test after using assert.step(). Unverified steps: ${this.steps.join(', ')}`,
      });
    } else if (this.expectedAssertionCount && this.expectedAssertionCount !== this.totalExecutedAssertions) {
      this.assert!.pushResult({
        result: false,
        actual: this.totalExecutedAssertions,
        expected: this.expectedAssertionCount,
        message: `Expected ${this.expectedAssertionCount} assertions, but ${this.totalExecutedAssertions} were run for test: ${this.name}`,
      });
    }
  }
}

