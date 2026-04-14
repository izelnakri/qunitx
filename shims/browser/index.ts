import QUnit from '../../vendor/qunit.js';
import type { HookFn, HooksObject } from '../types.ts';

// QUnit's type declarations omit the .skip/.todo/.only extensions on module/test.
// Define the minimal shape we actually call rather than reaching for `any`.
type QUnitHookFn = (this: Record<string, unknown>, assert: unknown) => void | Promise<void>;
interface QUnitHooks { before: (fn: QUnitHookFn) => void; beforeEach: (fn: QUnitHookFn) => void; afterEach: (fn: QUnitHookFn) => void; after: (fn: QUnitHookFn) => void; }
interface QUnitWithExtensions {
  module: ((name: string, fn: (this: Record<string, unknown>, hooks: QUnitHooks) => void) => void) & { skip(name: string): void };
  test: ((name: string, fn: QUnitHookFn) => void) & { skip(name: string): void; todo(name: string, fn: QUnitHookFn): void };
}
const _QUnit = QUnit as unknown as QUnitWithExtensions;

QUnit.config.autostart = false;

export const isLocal = QUnit.isLocal;
export const on = QUnit.on;
export const skip = QUnit.skip;
export const start = QUnit.start;
export const is = QUnit.is;
export const extend = QUnit.extend;
export const stack = QUnit.stack;
export const onUnhandledRejection = QUnit.onUnhandledRejection;
export const assert = QUnit.assert;
export const dump = QUnit.dump;
export const done = QUnit.done;
export const testStart = QUnit.testStart;
export const moduleStart = QUnit.moduleStart;
export const version = QUnit.version;
export const todo = QUnit.todo;
export const only = QUnit.only;
export const config = QUnit.config;
export const objectType = QUnit.objectType;
export const load = QUnit.load;
export const onError = QUnit.onError;
export const pushFailure = QUnit.pushFailure;
export const equiv = QUnit.equiv;
export const begin = QUnit.begin;
export const log = QUnit.log;
export const testDone = QUnit.testDone;
export const moduleDone = QUnit.moduleDone;
export const diff = QUnit.diff;

// Wrap QUnit's hooks object so each registered hook callback receives
// `{ context: this }` as its second argument (arrow-function-friendly).
// Must use regular functions — QUnit sets `this` to testEnvironment when calling them.
// The meta object is allocated once per hook registration and reused across test runs;
// `meta.context` is updated to the current testEnvironment before each invocation.
function wrapHooks(qunitHooks: QUnitHooks): HooksObject {
  return {
    before(fn: HookFn) {
      const meta = { context: {} };
      qunitHooks.before(function (this: Record<string, unknown>, assert: unknown) { meta.context = this; return fn.call(this, assert, meta); });
    },
    beforeEach(fn: HookFn) {
      const meta = { context: {} };
      qunitHooks.beforeEach(function (this: Record<string, unknown>, assert: unknown) { meta.context = this; return fn.call(this, assert, meta); });
    },
    afterEach(fn: HookFn) {
      const meta = { context: {} };
      qunitHooks.afterEach(function (this: Record<string, unknown>, assert: unknown) { meta.context = this; return fn.call(this, assert, meta); });
    },
    after(fn: HookFn) {
      const meta = { context: {} };
      qunitHooks.after(function (this: Record<string, unknown>, assert: unknown) { meta.context = this; return fn.call(this, assert, meta); });
    },
  };
}

/**
 * Defines a test module (suite) for the QUnit browser runner.
 *
 * Wraps `QUnit.module()` and injects `context` into every hook and test callback,
 * making shared state accessible without relying on `this` — so arrow functions work.
 *
 * @param {string} moduleName - Name of the test suite.
 * @param {object} [runtimeOptions] - Optional options object. Only `skip` is acted on
 *   in the browser (`{ skip: true }` delegates to `QUnit.module.skip`); all other
 *   properties are ignored since Node/Deno-specific runner options have no QUnit equivalent.
 * @param {function} moduleContent - Callback that defines tests and hooks.
 *   Receives `(hooks, { moduleName, options, context })`.
 *   `context` is the QUnit test environment for this module — the same object as `this`
 *   in regular-function callbacks.
 * @returns {void}
 * @example
 * ```js
 * import { module, test } from "qunitx";
 *
 * module("Math", (hooks, { context }) => {
 *   context.multiplier = 2;
 *
 *   hooks.beforeEach((assert, { context }) => {
 *     context.value = 21;
 *   });
 *
 *   test("multiplication", (assert, { context }) => {
 *     assert.equal(context.value * context.multiplier, 42);
 *   });
 * });
 * ```
 */
export function module(moduleName: string, moduleContent: (hooks: HooksObject, meta: { moduleName: string; options: unknown; context: Record<string, unknown> }) => void): void;
/** Defines a test module (suite) with optional options forwarded from cross-runtime code. Only `{ skip: true }` is acted on in the browser. */
export function module(moduleName: string, runtimeOptions: object, moduleContent: (hooks: HooksObject, meta: { moduleName: string; options: unknown; context: Record<string, unknown> }) => void): void;
export function module(
  moduleName: string,
  runtimeOptionsOrContent: object | ((hooks: HooksObject, meta: { moduleName: string; options: unknown; context: Record<string, unknown> }) => void),
  moduleContent?: (hooks: HooksObject, meta: { moduleName: string; options: unknown; context: Record<string, unknown> }) => void,
): void {
  const hasOptions = moduleContent !== undefined;
  const callback = (hasOptions ? moduleContent : runtimeOptionsOrContent) as (hooks: HooksObject, meta: { moduleName: string; options: unknown; context: Record<string, unknown> }) => void;
  const options = hasOptions ? runtimeOptionsOrContent as object : {};
  const { skip } = options as { skip?: boolean | string };

  if (skip) {
    _QUnit.module.skip(moduleName);
    return;
  }

  _QUnit.module(moduleName, function (this: Record<string, unknown>, qunitHooks: object) {
    callback.call(this, wrapHooks(qunitHooks as QUnitHooks), { moduleName, options, context: this });
  });
}

/**
 * Skips all tests inside a module. Equivalent to `QUnit.module.skip`.
 * The module is registered but all its tests are reported as skipped; no test bodies run.
 *
 * @param {string} moduleName - Name of the module to skip.
 * @example
 * ```js
 * import { module, test } from "qunitx";
 *
 * module.skip("Math — not yet implemented", () => {
 *   test("addition", (assert) => {
 *     assert.equal(1 + 1, 2);
 *   });
 * });
 * ```
 */
module.skip = function skipModule(moduleName: string): void {
  _QUnit.module.skip(moduleName);
};

/**
 * Defines an individual test within a module for the QUnit browser runner.
 *
 * Wraps `QUnit.test()` and injects `context` into the test callback, making the
 * QUnit test environment accessible without relying on `this` — so arrow functions work.
 *
 * Must be called inside a `module()` callback.
 *
 * @param {string} testName - Name of the test.
 * @param {object} [runtimeOptions] - Optional options object. `{ skip: true }` delegates to
 *   `QUnit.test.skip`; `{ todo: true | string }` delegates to `QUnit.test.todo`.
 *   Other Node/Deno runner-specific options are ignored in the browser.
 * @param {function} testContent - Test callback receiving `(assert, { testName, options, context })`.
 *   `context` is the QUnit test environment — the same object as `this` in regular-function callbacks,
 *   inheriting properties set by `before`/`beforeEach` hooks.
 * @returns {void}
 * @example
 * ```js
 * import { module, test } from "qunitx";
 *
 * module("Math", (hooks) => {
 *   test("addition", (assert) => {
 *     assert.equal(1 + 1, 2);
 *   });
 *
 *   test("async resolves correctly", async (assert) => {
 *     const result = await Promise.resolve(42);
 *     assert.strictEqual(result, 42);
 *   });
 * });
 * ```
 */
export function test(testName: string, testContent: (assert: unknown, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>): void;
/** Defines an individual test with optional options. `{ skip }` and `{ todo }` are acted on; other options are ignored in the browser. */
export function test(testName: string, runtimeOptions: object, testContent: (assert: unknown, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>): void;
export function test(
  testName: string,
  runtimeOptionsOrContent: object | ((assert: unknown, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>),
  testContent?: (assert: unknown, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>,
): void {
  const hasOptions = testContent !== undefined;
  const callback = (hasOptions ? testContent : runtimeOptionsOrContent) as (assert: unknown, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>;
  const options = hasOptions ? runtimeOptionsOrContent as object : {};
  const { skip, todo } = options as { skip?: boolean | string; todo?: boolean | string };

  if (skip) {
    _QUnit.test.skip(testName);
    return;
  }

  const meta = { testName, options: options as unknown, context: {} as Record<string, unknown> };
  const wrappedFn: QUnitHookFn = function (this: Record<string, unknown>, assert: unknown) {
    meta.context = this;
    return callback.call(this, assert, meta);
  };

  if (todo) {
    _QUnit.test.todo(testName, wrappedFn);
    return;
  }

  QUnit.test(testName, wrappedFn);
}

/**
 * Registers a skipped test. Equivalent to `QUnit.test.skip`.
 * The test is registered but never executed; reported as skipped in the browser UI.
 *
 * @param {string} testName - Name of the test to skip.
 * @example
 * ```js
 * import { module, test } from "qunitx";
 *
 * module("Math", () => {
 *   test.skip("addition is not yet implemented", (assert) => {
 *     assert.equal(1 + 1, 2);
 *   });
 * });
 * ```
 */
test.skip = function skipTest(testName: string): void {
  _QUnit.test.skip(testName);
};

/**
 * Registers a todo test. Equivalent to `QUnit.test.todo`.
 * The test body runs but failing assertions do not fail the suite — the test is
 * expected to be incomplete. Reported distinctly in the QUnit browser UI.
 * The callback is optional for cross-runtime parity (Node/Deno allow omitting it).
 *
 * @param {string} testName - Name of the test to mark as todo.
 * @param {function} [testContent] - Optional test body receiving `(assert, { testName, options, context })`.
 * @example
 * ```js
 * import { module, test } from "qunitx";
 *
 * module("Math", () => {
 *   test.todo("division is not yet implemented");
 *
 *   test.todo("multiplication", (assert) => {
 *     assert.equal(2 * 3, 6);
 *   });
 * });
 * ```
 */
test.todo = function todoTest(testName: string, testContent?: (assert: unknown, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>): void {
  if (!testContent) {
    _QUnit.test.todo(testName, function () {});
    return;
  }
  const meta = { testName, options: {} as unknown, context: {} as Record<string, unknown> };
  _QUnit.test.todo(testName, function (this: Record<string, unknown>, assert: unknown) {
    meta.context = this;
    return testContent.call(this, assert, meta);
  });
};

export default QUnit;
