import { assert, assertEquals, assertNotEquals, assertStrictEquals, assertNotStrictEquals, assertObjectMatch, assertRejects, assertThrows } from "https://deno.land/std@0.192.0/testing/asserts.ts";

class AssertionError extends Error {
  override name = 'AssertionError';
  constructor(message: string) {
    super(message);
  }
}

export default {
  _steps: [],
  async() {
    return () => {}; // NOTE: noop, deno has sanitizeResources
  },
  deepEqual: assertEquals,
  equal: assertEquals,
  expect() {
    return () => {}; // NOTE: NOT implemented
  },
  false(state, message) {
    return assert(state === false, message);
  },
  notDeepEqual: assertNotEquals,
  notEqual: assertNotEquals,
  notOk(state, message) {
    return assert(!state, message);
  },
  notPropContains() {
    throw new AssertionError('assert.notPropContains is not implemented for deno on QUnit');
  },
  notPropEqual() {
    throw new AssertionError('assert.notPropEqual is not implemented for deno on QUnit');
  },
  notStrictEqual: assertNotStrictEquals,
  ok: assert,
  propContains: assertObjectMatch,
  pushResult() {
    return () => {}; // NOTE: NOT implemented
  },
  rejects: assertRejects,
  step(value = '') {
    this._steps.push(value);
  },
  strictEqual: assertStrictEquals,
  throws: assertThrows,
  timeout() {
    return true; // NOTE: NOT implemented
  },
  true(state, message) {
    return assert(state === true, message);
  },
  verifySteps(steps, message = 'Verify steps failed!') {
    return assertEquals(this._steps, steps, message);
  }
};
