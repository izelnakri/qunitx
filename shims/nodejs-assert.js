import assert from 'node:assert';

// TODO: write test cases for these
export default {
  _steps: [],
  async: assert.async,
  deepEqual: assert.deepStrictEqual,
  equal: assert.strictEqual,
  expect() {
    return () => {}; // NOTE: NOT implemented
  },
  false: assert.false,
  notDeepEqual: assert.notDeepStrictEqual,
  notEqual: assert.notEqual,
  notOk(state, message) {
    return assert.ok(!state, message);
  },
  notPropContains: assert.notPropContains,
  notPropEqual: assert.notPropEqual,
  notStrictEqual: assert.notStrictEqual,
  ok: assert.ok,
  propContains: assert.propContains,
  pushResult: assert.pushResult,
  rejects: assert.rejects,
  step(value = '') {
    this._steps.push(value);
  },
  strictEqual: assert.strictEqual,
  throws: assert.throws,
  timeout: assert.timeout,
  true: assert.true,
  verifySteps(steps, message = 'Verify steps failed!') {
    return assert.deepEqual(this._steps, steps, message);
  }
};
