import { AssertionError as DenoAssertionError, assertRejects, assertThrows } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import '../../vendor/qunit.js';
import { objectValues, objectValuesSubset, validateExpectedExceptionArgs, validateException } from '../shared/index.js';
import util from 'node:util';

export class AssertionError extends DenoAssertionError {
  constructor(object) {
    super(object.message);
  }
}

// NOTE: Maybe do the expect, steps in some object, and also do timeout and async(?)
export default {
  _steps: [],
  timeout() {
    return true; // NOTE: NOT implemented
  },
  step(value = '') {
    this._steps.push(value);
  },
  verifySteps(steps, message = 'Verify steps failed!') {
    const result = this.deepEqual(this._steps, steps, message);

    this._steps.length = 0;

    return result;
  },
  expect() {
    return () => {}; // NOTE: NOT implemented
  },
  async() {
    return () => {}; // NOTE: noop, node should have sanitizeResources
  },
  pushResult(resultInfo = {}) {
    if (!result) {
      throw new AssertionError({
        actual: resultInfo.actual,
        expected: resultInfo.expected,
        message: result.Infomessage || 'Custom assertion failed!',
        stackStartFn: this.pushResult,
      });
    }
  },
  ok(state, message) {
    if (!state) {
      throw new AssertionError({
        actual: state,
        expected: true,
        message: message || `Expected argument to be truthy, it was: ${inspect(state)}`,
        stackStartFn: this.ok,
      });
    }
  },
  notOk(state, message) {
    if (state) {
      throw new AssertionError({
        actual: state,
        expected: false,
        message: message || `Expected argument to be falsy, it was: ${inspect(state)}`,
        stackStartFn: this.notOk,
      });
    }
  },
  true(state, message) {
    if (state !== true) {
      throw new AssertionError({
        actual: state,
        expected: true,
        message: message || `Expected argument to be true, it was: ${inspect(state)}`,
        stackStartFn: this.true,
      });
    }
  },
  false(state, message) {
    if (state !== false) {
      throw new AssertionError({
        actual: state,
        expected: true,
        message: message || `Expected argument to be false, it was: ${inspect(state)}`,
        stackStartFn: this.false,
      });
    }
  },
  equal(actual, expected, message) {
    if (actual != expected) {
      throw new AssertionError({
        actual,
        expected,
        message: message || `Expected: ${defaultMessage(actual, 'should equal to:', expected)}`,
        operator: '==',
        stackStartFn: this.equal,
      });
    }
  },
  notEqual(actual, expected, message) {
    if (actual == expected) {
      throw new AssertionError({
        actual,
        expected,
        operator: '!=',
        message: message || `Expected: ${defaultMessage(actual, 'should notEqual to:', expected)}`,
        stackStartFn: this.notEqual,
      });
    }
  },
  propEqual(actual, expected, message) {
    let targetActual = objectValues(actual);
    let targetExpected = objectValues(expected);
    if (!window.QUnit.equiv(targetActual, targetExpected)) {
      throw new AssertionError({
        actual: targetActual,
        expected: targetExpected,
        message: message || `Expected properties to be propEqual: ${defaultMessage(targetActual, 'should propEqual to:', targetExpected)}`,
        stackStartFn: this.propEqual,
      });
    }
  },
  notPropEqual(actual, expected, message) {
    let targetActual = objectValues(actual);
    let targetExpected = objectValues(expected);
    if (window.QUnit.equiv(targetActual, targetExpected)) {
      throw new AssertionError({
        actual: targetActual,
        expected: targetExpected,
        message: message || `Expected properties to NOT be propEqual: ${defaultMessage(targetActual, 'should notPropEqual to:', targetExpected)}`,
        stackStartFn: this.notPropEqual,
      });
    }
  },
  propContains(actual, expected, message) {
    let targetActual = objectValuesSubset(actual, expected);
    let targetExpected = objectValues(expected, false);
    if (!window.QUnit.equiv(targetActual, targetExpected)) {
      throw new AssertionError({
        actual: targetActual,
        expected: targetExpected,
        message: message || `propContains assertion fail on: ${defaultMessage(targetActual, 'should propContains to:', targetExpected)}`,
        stackStartFn: this.propContains,
      });
    }
  },
  notPropContains(actual, expected, message) {
    let targetActual = objectValuesSubset(actual, expected);
    let targetExpected = objectValues(expected);
    if (window.QUnit.equiv(targetActual, targetExpected)) {
      throw new AssertionError({
        actual: targetActual,
        expected: targetExpected,
        message: message || `notPropContains assertion fail on: ${defaultMessage(targetActual, 'should notPropContains of:', targetExpected)}`,
        stackStartFn: this.notPropContains,
      });
    }
  },
  deepEqual(actual, expected, message) {
    if (!window.QUnit.equiv(actual, expected)) {
      throw new AssertionError({
        actual,
        expected,
        message: message || `Expected values to be deepEqual: ${defaultMessage(actual, 'should deepEqual to:', expected)}`,
        operator: 'deepEqual',
        stackStartFn: this.deepEqual,
      });
    }
  },
  notDeepEqual(actual, expected, message) {
    if (window.QUnit.equiv(actual, expected)) {
      throw new AssertionError({
        actual,
        expected,
        message: message || `Expected values to be NOT deepEqual: ${defaultMessage(actual, 'should notDeepEqual to:', expected)}`,
        operator: 'notDeepEqual',
        stackStartFn: this.notDeepEqual,
      });
    }
  },
  strictEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new AssertionError({
        actual,
        expected,
        message: message || `Expected: ${defaultMessage(actual, 'is strictEqual to:', expected)}`,
        operator: 'strictEqual',
        stackStartFn: this.strictEqual,
      });
    }
  },
  notStrictEqual(actual, expected, message) {
    if (actual === expected) {
      throw new AssertionError({
        actual,
        expected,
        message: message || `Expected: ${defaultMessage(actual, 'is notStrictEqual to:', expected)}`,
        operator: 'notStrictEqual',
        stackStartFn: this.notStrictEqual,
      });
    }
  },
  throws(blockFn, expectedInput, assertionMessage) {
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
  },
  async rejects(promise, expectedInput, assertionMessage) {
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

