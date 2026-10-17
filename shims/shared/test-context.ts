import type Assert from './assert.ts';
import type ModuleContext from './module-context.ts';

export default class TestContext {
  static Assert: typeof Assert;

  name: string | undefined;
  module: ModuleContext | undefined;
  asyncOps: Promise<void>[] = [];
  assert: Assert | undefined;
  timeout: number | undefined;
  steps: string[] = [];
  stepsCount = 0;
  expectedAssertionCount: number | undefined;
  totalExecutedAssertions = 0;
  userContext: Record<string, unknown> = {};

  rejectTimeout: ((err: Error) => void) | undefined;
  #timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  #timedOut = false;

  constructor(name?: string, moduleContext?: ModuleContext) {
    if (moduleContext) {
      this.name = `${moduleContext.name} | ${name}`;
      this.module = moduleContext;
      this.module.tests.push(this);
      this.assert = new TestContext.Assert(moduleContext, this);
    }
  }

  // 0 fires on the next macrotask: a synchronous test has finished by then, and any
  // other fails, which is what QUnit's `assert.timeout(0)` means.
  setTimeoutDuration(ms: number) {
    if (this.#timeoutHandle !== undefined) {
      clearTimeout(this.#timeoutHandle);
      this.#timeoutHandle = undefined;
    }
    if (!this.rejectTimeout) return;
    this.#timeoutHandle = setTimeout(() => {
      this.#timedOut = true;
      this.rejectTimeout!(new Error(
        ms === 0
          ? 'Test did not finish synchronously even though assert.timeout( 0 ) was used.'
          : `Test took longer than ${ms}ms; test timed out.`,
      ));
    }, ms);
  }

  clearTimeoutHandle() {
    if (this.#timeoutHandle !== undefined) {
      clearTimeout(this.#timeoutHandle);
      this.#timeoutHandle = undefined;
    }
  }

  finish() {
    if (this.#timedOut) return;
    if (this.steps.length > 0) {
      this.assert!.pushResult({
        result: false,
        actual: this.steps,
        expected: [],
        message: `Expected assert.verifySteps() to be called before end of test after using assert.step(). Unverified steps: ${this.steps.join(', ')}`,
      });
    } else if (
      this.expectedAssertionCount !== undefined &&
      this.stepsCount > 0 &&
      this.expectedAssertionCount === this.totalExecutedAssertions + this.stepsCount
    ) {
      // The count QUnit 2 would have expected, which counted every assert.step() as well.
      this.assert!.pushResult({
        result: false,
        actual: this.totalExecutedAssertions,
        expected: this.expectedAssertionCount,
        message: `Expected ${this.expectedAssertionCount} assertions, but ${this.totalExecutedAssertions} were run for test: ${this.name}\nIt looks like you are upgrading from QUnit 2. Steps no longer count as separate assertions. https://qunitjs.com/api/assert/expect/`,
      });
    } else if (this.expectedAssertionCount !== undefined && this.expectedAssertionCount !== this.totalExecutedAssertions) {
      this.assert!.pushResult({
        result: false,
        actual: this.totalExecutedAssertions,
        expected: this.expectedAssertionCount,
        message: `Expected ${this.expectedAssertionCount} assertions, but ${this.totalExecutedAssertions} were run for test: ${this.name}`,
      });
    } else if (this.expectedAssertionCount === undefined && this.totalExecutedAssertions === 0) {
      this.assert!.pushResult({
        result: false,
        actual: this.totalExecutedAssertions,
        expected: '> 0',
        message: `Expected at least one assertion to be run for test: ${this.name}. Call assert.expect(0) to accept zero assertions.`,
      });
    }
  }
}
