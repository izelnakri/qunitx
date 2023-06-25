import { assert, assertEquals, assertNotEquals, assertStrictEquals, assertNotStrictEquals, assertObjectMatch } from "https://deno.land/std@0.192.0/testing/asserts.ts";

// TODO: Learn how to build custom assertions on deno.js, read _asserts.ts
// NOTE: Unstable API for now
export default {
  // async: assert.async,
  deepEqual: assertEquals,
  equal: assertEquals,
  // expect: assert.expect,
  false(state, message) {
    return assert(state === false, message);
  },
  notDeepEqual: assertNotEquals,
  notEqual: assertNotEquals,
  notOk(state, message) {
    return assert(!state, message);
  },
  // notPropContains: assertObjectMatch,
  // notPropEqual: assert.notPropEqual,
  notStrictEqual: assertNotStrictEquals,
  ok: assert,
  propContains: assertObjectMatch,
  // pushResult: assert.pushResult,
  // rejects: assert.rejects,
  // step: assert.step,
  strictEqual: assertStrictEquals,
  // throws: assert.throws,
  // timeout: assert.timeout,
  true(state, message) {
    return assert(state === true, message);
  },
  // verifySteps: assert.verifySteps
};
