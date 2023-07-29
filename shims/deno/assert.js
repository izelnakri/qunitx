import { AssertionError as DenoAssertionError, assertRejects, assertThrows } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import '../../vendor/qunit.js';
import { objectValues, objectValuesSubset, validateExpectedExceptionArgs, validateException } from '../shared/index.js';
import util from 'node:util';

export class AssertionError extends DenoAssertionError {
  constructor(object) {
    super(object.message);
  }
}

export default class Assert {
  AssertionError = AssertionError

  #asyncOps = [];

  constructor(module, test) {
    this.test = test || module;
  }
  _incrementAssertionCount() {
    this.test.totalExecutedAssertions++;
  }
  timeout(number) {
    if (!Number.isInteger(number) || number < 0) {
      throw new Error('assert.timeout() expects a positive integer.');
    }

    this.test.timeout = number;
  }
  step(message) {
    let assertionMessage = message;
    let result = !!message;

    this.test.steps.push(message);

    if (typeof message === 'undefined' || message === '') {
      assertionMessage = 'You must provide a message to assert.step';
    } else if (typeof message !== 'string') {
      assertionMessage = 'You must provide a string value to assert.step';
      result = false;
    }

    this.pushResult({
      result,
      message: assertionMessage
    });
  }
  verifySteps(steps, message = 'Verify steps failed!') {
    this.deepEqual(this.test.steps, steps, message);
    this.test.steps.length = 0;
  }
  expect(number) {
    if (!Number.isInteger(number) || number < 0) {
      throw new Error('assert.expect() expects a positive integer.');
    }

    this.test.expectedAssertionCount = number;
  }
  async() {
    let resolveFn;
    let done = new Promise(resolve => { resolveFn = resolve; });

    this.#asyncOps.push(done);

    return () => { resolveFn(); };
  }
  async waitForAsyncOps() {
    return Promise.all(this.#asyncOps);
  }
  pushResult(resultInfo = {}) {
    this._incrementAssertionCount();
    if (!resultInfo.result) {
      throw new AssertionError({
        actual: resultInfo.actual,
        expected: resultInfo.expected,
        message: resultInfo.message || 'Custom assertion failed!',
        stackStartFn: this.pushResult,
      });
    }

    return this;
  }
  ok(state, message) {
    this._incrementAssertionCount();
    if (!state) {
      throw new AssertionError({
        actual: state,
        expected: true,
        message: message || `Expected argument to be truthy, it was: ${inspect(state)}`,
        stackStartFn: this.ok,
      });
    }
  }
  notOk(state, message) {
    this._incrementAssertionCount();
    if (state) {
      throw new AssertionError({
        actual: state,
        expected: false,
        message: message || `Expected argument to be falsy, it was: ${inspect(state)}`,
        stackStartFn: this.notOk,
      });
    }
  }
  true(state, message) {
    this._incrementAssertionCount();
    if (state !== true) {
      throw new AssertionError({
        actual: state,
        expected: true,
        message: message || `Expected argument to be true, it was: ${inspect(state)}`,
        stackStartFn: this.true,
      });
    }
  }
  false(state, message) {
    this._incrementAssertionCount();
    if (state !== false) {
      throw new AssertionError({
        actual: state,
        expected: true,
        message: message || `Expected argument to be false, it was: ${inspect(state)}`,
        stackStartFn: this.false,
      });
    }
  }
  equal(actual, expected, message) {
    this._incrementAssertionCount();
    if (actual != expected) {
      throw new AssertionError({
        actual,
        expected,
        message: message || `Expected: ${defaultMessage(actual, 'should equal to:', expected)}`,
        operator: '==',
        stackStartFn: this.equal,
      });
    }
  }
  notEqual(actual, expected, message) {
    this._incrementAssertionCount();
    if (actual == expected) {
      throw new AssertionError({
        actual,
        expected,
        operator: '!=',
        message: message || `Expected: ${defaultMessage(actual, 'should notEqual to:', expected)}`,
        stackStartFn: this.notEqual,
      });
    }
  }
  propEqual(actual, expected, message) {
    this._incrementAssertionCount();
    let targetActual = objectValues(actual);
    let targetExpected = objectValues(expected);
    if (!QUnit.equiv(targetActual, targetExpected)) {
      throw new AssertionError({
        actual: targetActual,
        expected: targetExpected,
        message: message || `Expected properties to be propEqual: ${defaultMessage(targetActual, 'should propEqual to:', targetExpected)}`,
        stackStartFn: this.propEqual,
      });
    }
  }
  notPropEqual(actual, expected, message) {
    this._incrementAssertionCount();
    let targetActual = objectValues(actual);
    let targetExpected = objectValues(expected);
    if (QUnit.equiv(targetActual, targetExpected)) {
      throw new AssertionError({
        actual: targetActual,
        expected: targetExpected,
        message: message || `Expected properties to NOT be propEqual: ${defaultMessage(targetActual, 'should notPropEqual to:', targetExpected)}`,
        stackStartFn: this.notPropEqual,
      });
    }
  }
  propContains(actual, expected, message) {
    this._incrementAssertionCount();
    let targetActual = objectValuesSubset(actual, expected);
    let targetExpected = objectValues(expected, false);
    if (!QUnit.equiv(targetActual, targetExpected)) {
      throw new AssertionError({
        actual: targetActual,
        expected: targetExpected,
        message: message || `propContains assertion fail on: ${defaultMessage(targetActual, 'should propContains to:', targetExpected)}`,
        stackStartFn: this.propContains,
      });
    }
  }
  notPropContains(actual, expected, message) {
    this._incrementAssertionCount();
    let targetActual = objectValuesSubset(actual, expected);
    let targetExpected = objectValues(expected);
    if (QUnit.equiv(targetActual, targetExpected)) {
      throw new AssertionError({
        actual: targetActual,
        expected: targetExpected,
        message: message || `notPropContains assertion fail on: ${defaultMessage(targetActual, 'should notPropContains of:', targetExpected)}`,
        stackStartFn: this.notPropContains,
      });
    }
  }
  deepEqual(actual, expected, message) {
    this._incrementAssertionCount();
    if (!QUnit.equiv(actual, expected)) {
      throw new AssertionError({
        actual,
        expected,
        message: message || `Expected values to be deepEqual: ${defaultMessage(actual, 'should deepEqual to:', expected)}`,
        operator: 'deepEqual',
        stackStartFn: this.deepEqual,
      });
    }
  }
  notDeepEqual(actual, expected, message) {
    this._incrementAssertionCount();
    if (QUnit.equiv(actual, expected)) {
      throw new AssertionError({
        actual,
        expected,
        message: message || `Expected values to be NOT deepEqual: ${defaultMessage(actual, 'should notDeepEqual to:', expected)}`,
        operator: 'notDeepEqual',
        stackStartFn: this.notDeepEqual,
      });
    }
  }
  strictEqual(actual, expected, message) {
    this._incrementAssertionCount();
    if (actual !== expected) {
      throw new AssertionError({
        actual,
        expected,
        message: message || `Expected: ${defaultMessage(actual, 'is strictEqual to:', expected)}`,
        operator: 'strictEqual',
        stackStartFn: this.strictEqual,
      });
    }
  }
  notStrictEqual(actual, expected, message) {
    this._incrementAssertionCount();
    if (actual === expected) {
      throw new AssertionError({
        actual,
        expected,
        message: message || `Expected: ${defaultMessage(actual, 'is notStrictEqual to:', expected)}`,
        operator: 'notStrictEqual',
        stackStartFn: this.notStrictEqual,
      });
    }
  }
  throws(blockFn, expectedInput, assertionMessage) {
    this?._incrementAssertionCount();
    let [expected, message] = validateExpectedExceptionArgs(expectedInput, assertionMessage, 'rejects');
    if (typeof blockFn !== 'function') {
      throw new AssertionError({
        actual: blockFn,
        expected: Function,
        message: 'The value provided to `assert.throws` was not a function.',
        stackStartFn: this.throws,
      });
    }

    try {
      blockFn();
    } catch (error) {
      let validation = validateException(error, expected, message);
      if (validation.result === false) {
        throw new AssertionError({
          actual: validation.result,
          expected: validation.expected,
          message: validation.message,
          stackStartFn: this.throws,
        });
      }

      return;
    }

    throw new AssertionError({
      actual: blockFn,
      expected: expected,
      message: 'Function passed to `assert.throws` did not throw an exception!',
      stackStartFn: this.throws,
    });
  }
  async rejects(promise, expectedInput, assertionMessage) {
    this._incrementAssertionCount();
    let [expected, message] = validateExpectedExceptionArgs(expectedInput, assertionMessage, 'rejects');
    let then = promise && promise.then;
    if (typeof then !== 'function') {
      throw new AssertionError({
        actual: promise,
        expected: expected,
        message: 'The value provided to `assert.rejects` was not a promise!',
        stackStartFn: this.rejects,
      });
    }

    try {
      await promise;
      throw new AssertionError({
        actual: promise,
        expected: expected,
        message: 'The promise returned by the `assert.rejects` callback did not reject!',
        stackStartFn: this.rejects,
      });
    } catch (error) {
      let validation = validateException(error, expected, message);
      if (validation.result === false) {
        throw new AssertionError({
          actual: validation.result,
          expected: validation.expected,
          message: validation.message,
          stackStartFn: this.rejects,
        });
      }
    }
  }
};

function defaultMessage(actual, description, expected) {
  return `

${inspect(actual)}

${description}

${inspect(expected)}`
}

function inspect(value) {
  return util.inspect(value, { depth: 10, colors: true, compact: false });
}
