import { AssertionError as DenoAssertionError } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import '../../vendor/qunit.js';
import Assert from '../shared/assert.js';
import ModuleContext from '../shared/module-context.js';
import TestContext from '../shared/test-context.js';
import Module from './module.js';
import Test from './test.js';

export class AssertionError extends DenoAssertionError {
  constructor(object) {
    super(object.message);
  }
}

Assert.QUnit = globalThis.QUnit;
Assert.AssertionError = AssertionError;
ModuleContext.Assert = Assert;
TestContext.Assert = Assert;

Object.freeze(Assert);
Object.freeze(ModuleContext);
Object.freeze(TestContext);

export const module = Module;
export const test = Test;

export default { AssertionError: Assert.AssertionError, module, test, config: {} };
