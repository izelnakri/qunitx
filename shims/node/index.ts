/// <reference types="node" />
import { AssertionError } from 'node:assert';
import { inspect } from 'node:util';
import QUnit from '../../vendor/qunit.js';
import Assert from '../shared/assert.ts';
import ModuleContext from '../shared/module-context.ts';
import TestContext from '../shared/test-context.ts';
import Module from './module.ts';
import Test from './test.ts';

Assert.QUnit = QUnit;
Assert.AssertionError = AssertionError;
Assert.inspect = inspect;

ModuleContext.Assert = Assert;
TestContext.Assert = Assert;

Object.freeze(Assert);
Object.freeze(ModuleContext);
Object.freeze(TestContext);

export const module = Module;
export const test = Test;
export { Assert };

export default { AssertionError: Assert.AssertionError, module, test, config: {} };
