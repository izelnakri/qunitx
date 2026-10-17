import type Assert from './assert.ts';
import ModuleContext from './module-context.ts';
import type { HookFn } from '../types.ts';

/**
 * Hooks for every test in the run, in every module: `QUnit.hooks` for Node.js and Deno.
 * A global `beforeEach` runs before any module's, and a global `afterEach` after all of
 * them. Each receives `(assert, { context })`, with the test's context as `this`.
 */
const hooks: {
  beforeEach(fn: HookFn<Assert>): void;
  afterEach(fn: HookFn<Assert>): void;
} = {
  beforeEach(fn) {
    ModuleContext.globalHooks.beforeEach.push(fn);
  },
  afterEach(fn) {
    ModuleContext.globalHooks.afterEach.push(fn);
  },
};

export default hooks;
