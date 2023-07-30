import { AssertionError } from 'node:assert';
import QUnit from '../../vendor/qunit.js';
import Assert from '../shared/assert.js';
import ModuleContext from '../shared/module-context.js';
import TestContext from '../shared/test-context.js';
import Module from './module.js';
import Test from './test.js';

Assert.QUnit = QUnit;
Assert.AssertionError = AssertionError;
ModuleContext.Assert = Assert;
TestContext.Assert = Assert;

export const module = Module;
export const test = Test;

export default { AssertionError: Assert.AssertionError, module, test, config: {} };
