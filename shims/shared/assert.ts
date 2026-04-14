import '../../vendor/qunit.js';
import type { AssertionErrorConstructor, InspectFn, ModuleState, PushResultInfo, QUnitObject, TestState } from '../types.ts';
import { objectValues, objectValuesSubset, validateException, validateExpectedExceptionArgs } from './index.ts';

// Sentinel used by rejects() to distinguish "promise resolved" from "caught undefined".
const PENDING = Symbol('pending');

/**
 * The assertion object passed to every test callback and lifecycle hook.
 *
 * Every {@linkcode test} callback receives an instance of `Assert` as its first argument.
 * All assertion methods throw an {@linkcode AssertionError} on failure, which the test
 * runner catches and reports.
 *
 * @example
 * ```js
 * import { module, test } from "qunitx";
 *
 * module("Math", () => {
 *   test("addition", (assert) => {
 *     assert.equal(1 + 1, 2);
 *     assert.strictEqual(typeof 42, "number");
 *   });
 * });
 * ```
 */
export default class Assert {
  /** @internal Set by each runtime shim before tests run. */
  static QUnit: QUnitObject;
  /** @internal Set by each runtime shim before tests run. */
  static AssertionError: AssertionErrorConstructor;
  /** @internal Set by each runtime shim before tests run. */
  static inspect: InspectFn;

  /** @internal Mutable test state written during the test run. */
  test: TestState;

  /** @internal */
  constructor(module: ModuleState | null, test?: TestState) {
    this.test = test || (module as ModuleState).testContext;
  }

  /** @internal */
  private _incrementAssertionCount() {
    this.test.totalExecutedAssertions++;
  }

  /**
   * Sets the number of milliseconds after which the current test will fail if not yet complete.
   *
   * @param {number} number - Timeout in milliseconds (positive integer).
   * @example
   * ```js
   * test("slow async operation", async (assert) => {
   *   assert.timeout(500);
   *   await somethingAsync();
   *   assert.ok(true);
   * });
   * ```
   */
  timeout(number: number): void {
    if (!Number.isInteger(number) || number < 0) {
      throw new Error('assert.timeout() expects a positive integer.');
    }

    this.test.timeout = number;
    this.test.setTimeoutDuration(number);
  }

  /**
   * Records a named step. Use with {@linkcode Assert.prototype.verifySteps} to assert that
   * a sequence of steps occurred in the right order.
   *
   * @param {string} message - The step label to record.
   * @example
   * ```js
   * test("event order", (assert) => {
   *   assert.expect(3);
   *   assert.step("step one");
   *   assert.step("step two");
   *   assert.verifySteps(["step one", "step two"]);
   * });
   * ```
   */
  step(message: string): void {
    this.test.steps.push(message);

    const result = typeof message === 'string' && message.length > 0;
    const assertionMessage = result
      ? message
      : (message === undefined || message === '')
        ? 'You must provide a message to assert.step'
        : 'You must provide a string value to assert.step';

    this.pushResult({ result, message: assertionMessage });
  }

  /**
   * Asserts that the steps recorded via {@linkcode Assert.prototype.step} match the given array,
   * then clears the recorded steps.
   *
   * @param {string[]} steps - Expected array of step labels in order.
   * @param {string} [message] - Optional failure message.
   * @example
   * ```js
   * test("lifecycle order", (assert) => {
   *   assert.step("init");
   *   assert.step("run");
   *   assert.verifySteps(["init", "run"]);
   * });
   * ```
   */
  verifySteps(steps: string[], message = 'Verify steps failed!') {
    this.deepEqual(this.test.steps, steps, message);
    this.test.steps.length = 0;
  }

  /**
   * Sets the number of assertions expected to run in the current test.
   * The test fails if a different number of assertions actually ran.
   *
   * @param {number} number - Expected assertion count (non-negative integer).
   * @example
   * ```js
   * test("exactly two assertions", (assert) => {
   *   assert.expect(2);
   *   assert.ok(true);
   *   assert.ok(true);
   * });
   * ```
   */
  expect(number: number): void {
    if (!Number.isInteger(number) || number < 0) {
      throw new Error('assert.expect() expects a positive integer.');
    }

    this.test.expectedAssertionCount = number;
  }

  /**
   * Returns a `done` callback for callback-style async tests. The test will not
   * finish until every `done` callback returned by `async()` has been called.
   *
   * For `async/await` tests prefer `async (assert) => { ... }` directly.
   *
   * @returns {function} A callback to invoke when the async work finishes.
   * @example
   * ```js
   * test("async callback style", (assert) => {
   *   const done = assert.async();
   *   setTimeout(() => {
   *     assert.ok(true, "async callback ran");
   *     done();
   *   }, 10);
   * });
   * ```
   */
  async(): () => void {
    const { promise, resolve } = Promise.withResolvers<void>();
    this.test.asyncOps.push(promise);
    return resolve;
  }

  /** @internal Used by the test runner to wait for all async operations to complete. */
  waitForAsyncOps(): Promise<void[]> {
    return Promise.all(this.test.asyncOps);
  }

  /**
   * Pushes a custom assertion result. Fails the test if `resultInfo.result` is falsy.
   * Throws an {@linkcode AssertionError} on failure.
   *
   * Useful for building custom assertion helpers.
   *
   * @param {{ result: boolean, actual?: unknown, expected?: unknown, message?: string }} resultInfo
   * @example
   * ```js
   * test("custom assertion", (assert) => {
   *   assert.pushResult({
   *     result: 1 + 1 === 2,
   *     actual: 2,
   *     expected: 2,
   *     message: "custom math check",
   *   });
   * });
   * ```
   */
  pushResult(resultInfo: PushResultInfo = {}): this {
    this._incrementAssertionCount();
    if (!resultInfo.result) {
      throw new Assert.AssertionError({
        actual: resultInfo.actual,
        expected: resultInfo.expected,
        message: resultInfo.message || 'Custom assertion failed!',
        stackStartFn: this.pushResult,
      });
    }

    return this;
  }

  /**
   * Asserts that `state` is truthy.
   *
   * @param {unknown} state - The value to test.
   * @param {string} [message] - Optional failure message.
   * @example
   * ```js
   * assert.ok(true);
   * assert.ok(1, "non-zero is truthy");
   * assert.ok("hello");
   * ```
   */
  ok(state: unknown, message?: string): void {
    this._incrementAssertionCount();
    if (!state) {
      throw new Assert.AssertionError({
        actual: state,
        expected: true,
        message: message || `Expected argument to be truthy, it was: ${inspect(state)}`,
        stackStartFn: this.ok,
      });
    }
  }

  /**
   * Asserts that `state` is falsy.
   *
   * @param {unknown} state - The value to test.
   * @param {string} [message] - Optional failure message.
   * @example
   * ```js
   * assert.notOk(false);
   * assert.notOk(0, "zero is falsy");
   * assert.notOk(null);
   * ```
   */
  notOk(state: unknown, message?: string): void {
    this._incrementAssertionCount();
    if (state) {
      throw new Assert.AssertionError({
        actual: state,
        expected: false,
        message: message || `Expected argument to be falsy, it was: ${inspect(state)}`,
        stackStartFn: this.notOk,
      });
    }
  }

  /**
   * Asserts that `state === true` (strict boolean true).
   *
   * @param {unknown} state - The value to test.
   * @param {string} [message] - Optional failure message.
   * @example
   * ```js
   * assert.true(1 === 1);
   * assert.true(Array.isArray([]), "arrays are arrays");
   * ```
   */
  true(state: unknown, message?: string): void {
    this._incrementAssertionCount();
    if (state !== true) {
      throw new Assert.AssertionError({
        actual: state,
        expected: true,
        message: message || `Expected argument to be true, it was: ${inspect(state)}`,
        stackStartFn: this.true,
      });
    }
  }

  /**
   * Asserts that `state === false` (strict boolean false).
   *
   * @param {unknown} state - The value to test.
   * @param {string} [message] - Optional failure message.
   * @example
   * ```js
   * assert.false(1 === 2);
   * assert.false(Number.isNaN(42), "42 is not NaN");
   * ```
   */
  false(state: unknown, message?: string): void {
    this._incrementAssertionCount();
    if (state !== false) {
      throw new Assert.AssertionError({
        actual: state,
        expected: false,
        message: message || `Expected argument to be false, it was: ${inspect(state)}`,
        stackStartFn: this.false,
      });
    }
  }

  /**
   * Asserts that `actual == expected` (loose equality, allows type coercion).
   *
   * Prefer {@linkcode Assert.prototype.strictEqual} for most comparisons. Use {@linkcode Assert.prototype.notEqual}
   * for the inverse.
   *
   * @param {unknown} actual - The value produced by the code under test.
   * @param {unknown} expected - The expected value.
   * @param {string} [message] - Optional failure message.
   * @example
   * ```js
   * assert.equal(1, 1);
   * assert.equal("1", 1, "loose equality allows coercion");
   * ```
   */
  equal(actual: unknown, expected: unknown, message?: string): void {
    this._incrementAssertionCount();
    if (actual != expected) {
      throw new Assert.AssertionError({
        actual,
        expected,
        message: message || `Expected: ${defaultMessage(actual, 'should equal to:', expected)}`,
        operator: '==',
        stackStartFn: this.equal,
      });
    }
  }

  /**
   * Asserts that `actual != expected` (loose inequality). Inverse of {@linkcode Assert.prototype.equal}.
   *
   * @param {unknown} actual - The actual value.
   * @param {unknown} expected - The value it should not loosely equal.
   * @param {string} [message] - Optional failure message.
   * @example
   * ```js
   * assert.notEqual(1, 2);
   * assert.notEqual("hello", "world");
   * ```
   */
  notEqual(actual: unknown, expected: unknown, message?: string): void {
    this._incrementAssertionCount();
    if (actual == expected) {
      throw new Assert.AssertionError({
        actual,
        expected,
        operator: '!=',
        message: message || `Expected: ${defaultMessage(actual, 'should notEqual to:', expected)}`,
        stackStartFn: this.notEqual,
      });
    }
  }

  /**
   * Asserts that `actual` and `expected` have the same own enumerable properties
   * and values. Prototype methods are ignored; only own properties are compared.
   *
   * @param {object} actual - The actual object.
   * @param {object} expected - The expected object.
   * @param {string} [message] - Optional failure message.
   * @example
   * ```js
   * assert.propEqual({ a: 1, b: 2 }, { a: 1, b: 2 });
   *
   * // Ignores prototype methods — only own properties matter:
   * function Point(x, y) { this.x = x; this.y = y; }
   * assert.propEqual(new Point(1, 2), { x: 1, y: 2 });
   * ```
   */
  propEqual(actual: unknown, expected: unknown, message?: string): void {
    this._incrementAssertionCount();
    const targetActual = objectValues(actual);
    const targetExpected = objectValues(expected);
    if (!Assert.QUnit.equiv(targetActual, targetExpected)) {
      throw new Assert.AssertionError({
        actual: targetActual,
        expected: targetExpected,
        message: message || `Expected properties to be propEqual: ${defaultMessage(targetActual, 'should propEqual to:', targetExpected)}`,
        stackStartFn: this.propEqual,
      });
    }
  }

  /**
   * Asserts that `actual` and `expected` do NOT have the same own enumerable
   * properties and values. Inverse of {@linkcode Assert.prototype.propEqual}.
   *
   * @param {object} actual - The actual object.
   * @param {object} expected - The value it should not propEqual.
   * @param {string} [message] - Optional failure message.
   * @example
   * ```js
   * assert.notPropEqual({ a: 1 }, { a: 2 });
   * assert.notPropEqual({ a: 1, b: 2 }, { a: 1 }); // extra key makes them unequal
   * ```
   */
  notPropEqual(actual: unknown, expected: unknown, message?: string): void {
    this._incrementAssertionCount();
    const targetActual = objectValues(actual);
    const targetExpected = objectValues(expected);
    if (Assert.QUnit.equiv(targetActual, targetExpected)) {
      throw new Assert.AssertionError({
        actual: targetActual,
        expected: targetExpected,
        message: message || `Expected properties to NOT be propEqual: ${defaultMessage(targetActual, 'should notPropEqual to:', targetExpected)}`,
        stackStartFn: this.notPropEqual,
      });
    }
  }

  /**
   * Asserts that `actual` contains all own enumerable properties from `expected`
   * with matching values. Extra properties on `actual` are allowed and ignored.
   *
   * @param {object} actual - The actual object (may have extra keys).
   * @param {object} expected - The subset of key/value pairs that must be present.
   * @param {string} [message] - Optional failure message.
   * @example
   * ```js
   * assert.propContains({ a: 1, b: 2, c: 3 }, { a: 1, b: 2 });
   * assert.propContains(user, { role: "admin" });
   * ```
   */
  propContains(actual: unknown, expected: unknown, message?: string): void {
    this._incrementAssertionCount();
    const targetActual = objectValuesSubset(actual, expected);
    const targetExpected = objectValues(expected, false);
    if (!Assert.QUnit.equiv(targetActual, targetExpected)) {
      throw new Assert.AssertionError({
        actual: targetActual,
        expected: targetExpected,
        message: message || `propContains assertion fail on: ${defaultMessage(targetActual, 'should propContains to:', targetExpected)}`,
        stackStartFn: this.propContains,
      });
    }
  }

  /**
   * Asserts that `actual` does NOT contain all own enumerable properties
   * from `expected` with matching values. Inverse of {@linkcode Assert.prototype.propContains}.
   *
   * @param {object} actual - The actual object.
   * @param {object} expected - The subset of properties that must NOT all match.
   * @param {string} [message] - Optional failure message.
   * @example
   * ```js
   * assert.notPropContains({ a: 1, b: 2 }, { a: 9 });
   * assert.notPropContains(user, { role: "banned" });
   * ```
   */
  notPropContains(actual: unknown, expected: unknown, message?: string): void {
    this._incrementAssertionCount();
    const targetActual = objectValuesSubset(actual, expected);
    const targetExpected = objectValues(expected);
    if (Assert.QUnit.equiv(targetActual, targetExpected)) {
      throw new Assert.AssertionError({
        actual: targetActual,
        expected: targetExpected,
        message: message || `notPropContains assertion fail on: ${defaultMessage(targetActual, 'should notPropContains of:', targetExpected)}`,
        stackStartFn: this.notPropContains,
      });
    }
  }

  /**
   * Asserts deep equality between `actual` and `expected` using recursive structural
   * comparison. Handles nested objects, arrays, `Date`, `RegExp`, and more.
   *
   * @param {unknown} actual - The actual value.
   * @param {unknown} expected - The expected value.
   * @param {string} [message] - Optional failure message.
   * @example
   * ```js
   * assert.deepEqual([1, { a: 2 }], [1, { a: 2 }]);
   * assert.deepEqual(new Date("2024-01-01"), new Date("2024-01-01"));
   * ```
   */
  deepEqual(actual: unknown, expected: unknown, message?: string): void {
    this._incrementAssertionCount();
    if (!Assert.QUnit.equiv(actual, expected)) {
      throw new Assert.AssertionError({
        actual,
        expected,
        message: message || `Expected values to be deepEqual: ${defaultMessage(actual, 'should deepEqual to:', expected)}`,
        operator: 'deepEqual',
        stackStartFn: this.deepEqual,
      });
    }
  }

  /**
   * Asserts that `actual` and `expected` are NOT deeply equal. Inverse of {@linkcode Assert.prototype.deepEqual}.
   *
   * @param {unknown} actual - The actual value.
   * @param {unknown} expected - The value it should not deepEqual.
   * @param {string} [message] - Optional failure message.
   * @example
   * ```js
   * assert.notDeepEqual([1, 2], [1, 3]);
   * assert.notDeepEqual({ a: 1 }, { a: 2 });
   * ```
   */
  notDeepEqual(actual: unknown, expected: unknown, message?: string): void {
    this._incrementAssertionCount();
    if (Assert.QUnit.equiv(actual, expected)) {
      throw new Assert.AssertionError({
        actual,
        expected,
        message: message || `Expected values to be NOT deepEqual: ${defaultMessage(actual, 'should notDeepEqual to:', expected)}`,
        operator: 'notDeepEqual',
        stackStartFn: this.notDeepEqual,
      });
    }
  }

  /**
   * Asserts that `actual === expected` (strict equality, no type coercion).
   *
   * @param {unknown} actual - The actual value.
   * @param {unknown} expected - The expected value.
   * @param {string} [message] - Optional failure message.
   * @example
   * ```js
   * assert.strictEqual(1 + 1, 2);
   * assert.strictEqual(typeof "hello", "string");
   * ```
   */
  strictEqual(actual: unknown, expected: unknown, message?: string): void {
    this._incrementAssertionCount();
    if (actual !== expected) {
      throw new Assert.AssertionError({
        actual,
        expected,
        message: message || `Expected: ${defaultMessage(actual, 'is strictEqual to:', expected)}`,
        operator: 'strictEqual',
        stackStartFn: this.strictEqual,
      });
    }
  }

  /**
   * Asserts that `actual !== expected` (strict inequality). Inverse of {@linkcode Assert.prototype.strictEqual}.
   *
   * @param {unknown} actual - The actual value.
   * @param {unknown} expected - The value it should not strictly equal.
   * @param {string} [message] - Optional failure message.
   * @example
   * ```js
   * assert.notStrictEqual(1, "1", "different types");
   * assert.notStrictEqual({}, {}, "different object references");
   * ```
   */
  notStrictEqual(actual: unknown, expected: unknown, message?: string): void {
    this._incrementAssertionCount();
    if (actual === expected) {
      throw new Assert.AssertionError({
        actual,
        expected,
        message: message || `Expected: ${defaultMessage(actual, 'is notStrictEqual to:', expected)}`,
        operator: 'notStrictEqual',
        stackStartFn: this.notStrictEqual,
      });
    }
  }

  /**
   * Asserts that `blockFn` throws an exception. Optionally validates the thrown
   * error against a string (message substring), RegExp (message pattern),
   * or constructor (`instanceof` check). For async functions use {@linkcode Assert.prototype.rejects}.
   *
   * @param {function} blockFn - A synchronous function expected to throw.
   * @param {string|RegExp|function} [expected] - Optional matcher for the thrown error.
   * @param {string} [message] - Optional failure message.
   * @example
   * ```js
   * assert.throws(() => { throw new Error("boom"); });
   * assert.throws(() => JSON.parse("{bad}"), SyntaxError);
   * assert.throws(() => { throw new Error("bad input"); }, /bad input/);
   * ```
   */
  throws(blockFn: unknown, expectedInput?: unknown, assertionMessage?: string): void {
    this._incrementAssertionCount();
    const [expected, message] = validateExpectedExceptionArgs(expectedInput, assertionMessage, 'throws');
    if (typeof blockFn !== 'function') {
      throw new Assert.AssertionError({
        actual: blockFn,
        expected: Function,
        message: 'The value provided to `assert.throws` was not a function.',
        stackStartFn: this.throws,
      });
    }

    try {
      blockFn();
    } catch (error) {
      const [result, validatedExpected, validatedMessage] = validateException(error, expected, message);
      if (result === false) {
        throw new Assert.AssertionError({
          actual: result,
          expected: validatedExpected,
          message: validatedMessage,
          stackStartFn: this.throws,
        });
      }

      return;
    }

    throw new Assert.AssertionError({
      actual: blockFn,
      expected: expected,
      message: 'Function passed to `assert.throws` did not throw an exception!',
      stackStartFn: this.throws,
    });
  }

  /**
   * Asserts that a promise rejects. Optionally validates the rejection reason
   * against a string (message substring), RegExp (message pattern),
   * or constructor (`instanceof` check). For synchronous throws use {@linkcode Assert.prototype.throws}.
   *
   * @param {Promise<unknown>} promise - A promise expected to reject.
   * @param {string|RegExp|function} [expected] - Optional matcher for the rejection reason.
   * @param {string} [message] - Optional failure message.
   * @example
   * ```js
   * await assert.rejects(Promise.reject(new Error("oops")));
   * await assert.rejects(fetch("/bad-url"), TypeError);
   * await assert.rejects(Promise.reject(new Error("timeout")), /timeout/);
   * ```
   */
  async rejects(promise: unknown, expectedInput?: unknown, assertionMessage?: string): Promise<void> {
    this._incrementAssertionCount();
    const [expected, message] = validateExpectedExceptionArgs(expectedInput, assertionMessage, 'rejects');
    const then = promise && (promise as PromiseLike<unknown>).then;
    if (typeof then !== 'function') {
      throw new Assert.AssertionError({
        actual: promise,
        expected: expected,
        message: 'The value provided to `assert.rejects` was not a promise!',
        stackStartFn: this.rejects,
      });
    }

    let caught: unknown = PENDING;
    try {
      await promise;
    } catch (error) {
      caught = error;
    }

    if (caught === PENDING) {
      throw new Assert.AssertionError({
        actual: promise,
        expected: expected,
        message: 'The promise returned by the `assert.rejects` callback did not reject!',
        stackStartFn: this.rejects,
      });
    }

    const [result, validatedExpected, validatedMessage] = validateException(caught, expected, message);
    if (result === false) {
      throw new Assert.AssertionError({
        actual: result,
        expected: validatedExpected,
        message: validatedMessage,
        stackStartFn: this.rejects,
      });
    }
  }
}

function defaultMessage(actual: unknown, description: string, expected: unknown): string {
  return `

${inspect(actual)}

${description}

${inspect(expected)}`
}

const INSPECT_OPTIONS = { depth: 10, colors: true, compact: false as const };

function inspect(value: unknown): string {
  return Assert.inspect(value, INSPECT_OPTIONS);
}
