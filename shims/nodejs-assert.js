import assert from 'node:assert';

// TODO: write test cases for these
export default {
  async: assert.async,
  deepEqual: assert.deepStrictEqual,
  equal: assert.strictEqual,
  expect: assert.expect,
  false: assert.false,
  notDeepEqual: assert.notDeepStrictEqual,
  notEqual: assert.notEqual,
  notOk: assert.notOk,
  notPropContains: assert.notPropContains,
  notPropEqual: assert.notPropEqual,
  notStrictEqual: assert.notStrictEqual,
  ok: assert.ok,
  propContains: assert.propContains,
  pushResult: assert.pushResult,
  rejects: assert.rejects,
  step: assert.step,
  strictEqual: assert.strictEqual,
  throws: assert.throws,
  timeout: assert.timeout,
  true: assert.true,
  verifySteps: assert.verifySteps
};
