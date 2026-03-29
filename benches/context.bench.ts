// Benchmarks for TestContext and ModuleContext lifecycle.
// These objects are created once per test/module, so their construction cost
// adds directly to suite startup time at scale.
//
// Run: deno bench --allow-read benches/context.bench.js

import '../vendor/qunit.js';
import Assert from '../shims/shared/assert.ts';
import ModuleContext from '../shims/shared/module-context.ts';
import TestContext from '../shims/shared/test-context.ts';

class QXAssertionError extends Error {
  constructor(obj) {
    super(obj.message);
  }
}

Assert.QUnit = globalThis.QUnit;
Assert.AssertionError = QXAssertionError;
ModuleContext.Assert = Assert;
TestContext.Assert = Assert;

// --- ModuleContext ---

Deno.bench('ModuleContext - creation', () => {
  new ModuleContext('SuiteName');
  ModuleContext.currentModuleChain.pop();
});

// --- TestContext ---

// Create a reusable parent module for TestContext benchmarks.
const parentModule = new ModuleContext('Parent');
ModuleContext.currentModuleChain.pop();

Deno.bench('TestContext - creation', () => {
  new TestContext('test name', parentModule);
  parentModule.tests.pop();
});

// --- finish() ---

// finish() runs after every test to validate assertion counts & steps.
// Three paths: at-least-one assertion (fast path), zero assertions (fail), expect mismatch.

function makeFinishableTest(expectedCount) {
  const ctx = new TestContext('test', parentModule);
  parentModule.tests.pop();
  ctx.totalExecutedAssertions = 1;
  if (expectedCount !== undefined) ctx.expectedAssertionCount = expectedCount;
  return ctx;
}

const ctxFinishOk = makeFinishableTest();
Deno.bench('TestContext - finish (1 assertion, no expect)', () => {
  // Reset state so it doesn't accumulate across iterations.
  ctxFinishOk.totalExecutedAssertions = 1;
  ctxFinishOk.steps = [];
  ctxFinishOk.expectedAssertionCount = undefined;
  ctxFinishOk.finish();
});

const ctxFinishExpect = makeFinishableTest(1);
Deno.bench('TestContext - finish (expect matches)', () => {
  ctxFinishExpect.totalExecutedAssertions = 1;
  ctxFinishExpect.steps = [];
  ctxFinishExpect.expectedAssertionCount = 1;
  ctxFinishExpect.finish();
});
