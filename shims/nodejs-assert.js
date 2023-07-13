import assert from 'node:assert';

// TODO: write test cases for these
// TODO: basically keep going until const { message } = new assert.AssertionError({ actual, expected, operator, message });
export default {
  _steps: [],
  async() {
    return () => {}; // NOTE: noop, node should have sanitizeResources
  },
  deepEqual: assert.deepStrictEqual,
  equal: assert.strictEqual,
  expect() {
    return () => {}; // NOTE: NOT implemented
  },
  false(state, message) {
    return assert.strictEqual(state, false, message);
  },
  notDeepEqual: assert.notDeepStrictEqual,
  notEqual: assert.notStrictEqual,
  notOk(state, message) {
    return assert.ok(!state, message);
  },
  notPropContains() {
    // NOTE: NOT implemented, maybe this is possible(?):
    throw new AssertionError('assert.notPropContains is not implemented for node on QUnit');
  },
  notPropEqual() {
    // NOTE: NOT implemented, maybe this is possible(?):
    throw new AssertionError('assert.notPropEqual is not implemented node deno on QUnit');
  },
  notStrictEqual: assert.notStrictEqual,
  ok: assert.ok,
  propContains() {
    // NOTE: NOT implemented, maybe this is possible(?):
    throw new AssertionError('assert.notPropContains is not implemented for node on QUnit');
  },
  pushResult() {
    return () => {}; // NOTE: NOT implemented, maybe this is possible(?);
  },
  rejects: assert.rejects,
  step(value = '') {
    this._steps.push(value);
  },
  strictEqual: assert.strictEqual,
  throws: assert.throws,
  timeout() {
    return true; // NOTE: NOT implemented
  },
  true(state, message) {
    return assert.strictEqual(state, true, message);
  },
  verifySteps(steps, message = 'Verify steps failed!') {
    return assert.deepStrictEqual(this._steps, steps, message);
  }
};
