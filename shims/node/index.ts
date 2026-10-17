/// <reference types="node" />
import { AssertionError as NodeAssertionError } from 'node:assert';
import { inspect } from 'node:util';
import QUnit from '../../vendor/qunit.js';
import Assert from '../shared/assert.ts';
import config from '../shared/config.ts';
import { filterStack } from '../shared/filter-stack.ts';
import ModuleContext from '../shared/module-context.ts';
import TestContext from '../shared/test-context.ts';
import Module from './module.ts';
import Test from './test.ts';

// Subclass node:assert's AssertionError so every `throw new Assert.AssertionError(...)`
// site in shims/shared/assert.ts gets a filtered stack without per-callsite changes.
// instanceof checks against node:assert's AssertionError still pass (we extend it).
class AssertionError extends NodeAssertionError {
  constructor(opts: ConstructorParameters<typeof NodeAssertionError>[0]) {
    super(opts);
    this.stack = filterStack(this.stack);
  }
}

Assert.QUnit = QUnit;
Assert.AssertionError = AssertionError;
Assert.inspect = inspect;

ModuleContext.Assert = Assert;
TestContext.Assert = Assert;

Object.freeze(Assert);
Object.freeze(ModuleContext);
Object.freeze(TestContext);

// Re-exported from their modules, not as the local bindings above: a declaration file
// imports those with `import type`, which would make `export { Assert }` a type only.
export { default as Assert } from '../shared/assert.ts';
export { default as config } from '../shared/config.ts';
export { default as hooks } from '../shared/global-hooks.ts';
// BDD-style aliases. Same function objects as `module`/`test`, so `describe.skip`,
// `describe.todo`, `it.skip`, and `it.todo` come along for free.
export { default as describe } from './module.ts';
export { default as it } from './test.ts';
export { default as module } from './module.ts';
export const only = Test.only;
export const skip = Test.skip;
export { default as test } from './test.ts';
export const todo = Test.todo;
export type { HookFn, HooksObject, PushResultInfo, TestFn } from '../types.ts';

export default {
  AssertionError: Assert.AssertionError,
  describe: Module,
  it: Test,
  module: Module,
  test: Test,
  config,
};
