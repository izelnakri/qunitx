// Benchmarks for core assertion methods in shims/shared/assert.js.
// Measures the hot path that runs for every assertion in every test.
//
// Run: deno bench --allow-read benches/assert.bench.js

import '../vendor/qunit.js';
import Assert from '../shims/shared/assert.ts';
import TestContext from '../shims/shared/test-context.ts';

class QXAssertionError extends Error {
  constructor(obj) {
    super(obj.message);
  }
}

Assert.QUnit = globalThis.QUnit;
Assert.AssertionError = QXAssertionError;
TestContext.Assert = Assert;

function makeAssert() {
  const test = { totalExecutedAssertions: 0, steps: [], asyncOps: [] };
  return new Assert(null, test);
}

// --- Truthy / falsy ---

const assertOk = makeAssert();
Deno.bench('ok - passing', () => {
  assertOk.ok(true);
});

const assertNotOk = makeAssert();
Deno.bench('notOk - passing', () => {
  assertNotOk.notOk(false);
});

const assertTrue = makeAssert();
Deno.bench('true - passing', () => {
  assertTrue.true(true);
});

const assertFalse = makeAssert();
Deno.bench('false - passing', () => {
  assertFalse.false(false);
});

// --- Equality ---

const assertEqual = makeAssert();
Deno.bench('equal - passing', () => {
  assertEqual.equal(1, 1);
});

const assertStrictEqual = makeAssert();
Deno.bench('strictEqual - passing', () => {
  assertStrictEqual.strictEqual('hello', 'hello');
});

const assertNotStrictEqual = makeAssert();
Deno.bench('notStrictEqual - passing', () => {
  assertNotStrictEqual.notStrictEqual(1, '1');
});

// --- Deep equality ---

const flatObj = { a: 1, b: 2, c: 3 };
const assertDeepFlat = makeAssert();
Deno.bench('deepEqual - flat object', () => {
  assertDeepFlat.deepEqual({ a: 1, b: 2, c: 3 }, flatObj);
});

const nestedObj = { a: { b: { c: 1 } }, d: [1, 2, 3] };
const assertDeepNested = makeAssert();
Deno.bench('deepEqual - nested object', () => {
  assertDeepNested.deepEqual({ a: { b: { c: 1 } }, d: [1, 2, 3] }, nestedObj);
});

// --- Prop equality ---

const assertPropEqual = makeAssert();
Deno.bench('propEqual - flat object', () => {
  assertPropEqual.propEqual({ a: 1, b: 2 }, { a: 1, b: 2 });
});

const assertPropContains = makeAssert();
Deno.bench('propContains - subset', () => {
  assertPropContains.propContains({ a: 1, b: 2, c: 3 }, { a: 1, b: 2 });
});

// --- Base method ---

const assertPushResult = makeAssert();
Deno.bench('pushResult - passing', () => {
  assertPushResult.pushResult({ result: true, actual: 1, expected: 1, message: 'ok' });
});

// --- Step tracking ---

const assertStep = makeAssert();
Deno.bench('step + verifySteps', () => {
  assertStep.test.steps = [];
  assertStep.test.totalExecutedAssertions = 0;
  assertStep.step('a');
  assertStep.step('b');
  assertStep.verifySteps(['a', 'b']);
});

// --- Exception assertion ---

const assertThrows = makeAssert();
Deno.bench('throws - passing', () => {
  assertThrows.throws(() => {
    throw new Error('boom');
  });
});
