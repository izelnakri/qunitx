import QUnit from '../../vendor/qunit.js';
import type { EachCallback, EachData, HookFn, HooksObject, IfTest, OnlyTest, SkipTest, TestContent, TodoTest } from '../types.ts';

// QUnit's type declarations omit the .skip/.todo/.only extensions on module/test.
// Define the minimal shape we actually call rather than reaching for `any`.
type QUnitHookFn = (this: Record<string, unknown>, assert: unknown) => void | Promise<void>;
interface QUnitHooks { before: (fn: QUnitHookFn) => void; beforeEach: (fn: QUnitHookFn) => void; afterEach: (fn: QUnitHookFn) => void; after: (fn: QUnitHookFn) => void; }
type QUnitModuleScope = (this: Record<string, unknown>, hooks: QUnitHooks) => unknown;
type QUnitEach = (name: string, dataset: unknown, fn: (...args: never[]) => unknown) => void;
interface QUnitWithExtensions {
  module: ((name: string, fn: QUnitModuleScope) => void) & {
    skip(name: string, fn?: () => void): void;
    todo(name: string, fn?: () => void): void;
    only(name: string, fn: QUnitModuleScope): void;
  };
  test: ((name: string, fn: QUnitHookFn) => void) & {
    skip: ((name: string) => void) & { each(name: string, dataset: unknown): void };
    todo: ((name: string, fn: QUnitHookFn) => void) & { each: QUnitEach };
    only: ((name: string, fn: QUnitHookFn) => void) & { each: QUnitEach };
    if: { each(name: string, condition: unknown, dataset: unknown, fn: (...args: never[]) => unknown): void };
    each: QUnitEach;
  };
  hooks: { beforeEach(fn: QUnitHookFn): void; afterEach(fn: QUnitHookFn): void };
}
const _QUnit = QUnit as unknown as QUnitWithExtensions;

QUnit.config.autostart = false;

export const assert = QUnit.assert;
export const begin = QUnit.begin;
export const config = QUnit.config;
export const diff = QUnit.diff;
export const done = QUnit.done;
export const dump = QUnit.dump;
export const equiv = QUnit.equiv;
export const extend = QUnit.extend;
export const is = QUnit.is;
export const isLocal = QUnit.isLocal;
export const log = QUnit.log;
export const moduleDone = QUnit.moduleDone;
export const moduleStart = QUnit.moduleStart;
export const objectType = QUnit.objectType;
export const on = QUnit.on;
export const onUncaughtException = QUnit.onUncaughtException;
export const pushFailure = QUnit.pushFailure;
export const reporters = QUnit.reporters;
export const stack = QUnit.stack;
export const start = QUnit.start;
export const testDone = QUnit.testDone;
export const testStart = QUnit.testStart;
export const urlParams = QUnit.urlParams;
export const version = QUnit.version;

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
  const { skip, only } = options as { skip?: boolean | string; only?: boolean };

  if (skip) {
    // The empty callback is load-bearing — see skipScopeNote below.
    _QUnit.module.skip(moduleName, function () {});
    return;
  }

  // The callback's result is handed back so QUnit 3 can reject an async one.
  const scope: QUnitModuleScope = function (this: Record<string, unknown>, qunitHooks) {
    return callback.call(this, wrapHooks(qunitHooks), { moduleName, options, context: this });
  };
  if (only) _QUnit.module.only(moduleName, scope);
  else _QUnit.module(moduleName, scope);
}

// skipScopeNote: every QUnit.module.skip/.todo call below passes an empty callback,
// and must keep doing so. QUnit's processModule() assigns `config.currentModule = module`
// unconditionally, but only restores the previous module inside its
// `if (typeof scope === 'function')` branch. Called without a callback, the skipped
// module stays the current module for the rest of the file, so every sibling test
// declared afterwards is reparented under it and reported as skipped. Passing a
// callback — even an empty one — takes the branch that restores the scope.
// The callback is never invoked for a skipped module, so nothing else changes.

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
  _QUnit.module.skip(moduleName, function () {});
};

/**
 * Marks all tests inside a module as todo. Equivalent to `QUnit.module.todo`.
 * The module is registered as todo in the QUnit browser runner.
 *
 * @param {string} moduleName - Name of the module to mark as todo.
 * @example
 * ```js
 * import { module, test } from "qunitx";
 *
 * module.todo("Math — not yet implemented", () => {
 *   test("addition", (assert) => {
 *     assert.equal(1 + 1, 2);
 *   });
 * });
 * ```
 */
module.todo = function todoModule(moduleName: string): void {
  _QUnit.module.todo(moduleName, function () {});
};

/**
 * Runs only this module, and any other `only` module or test. Equivalent to
 * `QUnit.module.only`, and to passing `{ only: true }`.
 *
 * @param {string} moduleName - Name of the module.
 * @param {object} [runtimeOptions] - Optional options, as for {@linkcode module}.
 * @param {function} moduleContent - Callback that defines tests and hooks.
 */
module.only = function onlyModule(moduleName: string, runtimeOptionsOrContent: object | ModuleContent, moduleContent?: ModuleContent): void {
  const [options, content] = getModuleArguments(runtimeOptionsOrContent, moduleContent);
  module(moduleName, { ...options, only: true }, content);
};

/**
 * Defines a module that runs only when `condition` is truthy, and is skipped otherwise.
 * Equivalent to `QUnit.module.if`.
 *
 * @param {string} moduleName - Name of the module.
 * @param {unknown} condition - Whether to run the module's tests.
 * @param {object} [runtimeOptions] - Optional options, as for {@linkcode module}.
 * @param {function} moduleContent - Callback that defines tests and hooks.
 */
module.if = function ifModule(moduleName: string, condition: unknown, runtimeOptionsOrContent: object | ModuleContent, moduleContent?: ModuleContent): void {
  const [options, content] = getModuleArguments(runtimeOptionsOrContent, moduleContent);
  module(moduleName, condition ? options : { ...options, skip: true }, content);
};

type ModuleContent = (hooks: HooksObject, meta: { moduleName: string; options: unknown; context: Record<string, unknown> }) => void;

function getModuleArguments(optionsOrContent: object | ModuleContent, content?: ModuleContent): [object, ModuleContent] {
  return content ? [optionsOrContent as object, content] : [{}, optionsOrContent as ModuleContent];
}

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
  const { skip, todo, only } = options as { skip?: boolean | string; todo?: boolean | string; only?: boolean };

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

  if (only) _QUnit.test.only(testName, wrappedFn);
  else QUnit.test(testName, wrappedFn);
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
test.skip = Object.assign(function skipTest(testName: string, _testContent?: unknown): void {
  _QUnit.test.skip(testName);
}, {
  /** Registers a skipped test for each case of `dataset`. Equivalent to `QUnit.test.skip.each`. */
  each(testName: string, dataset: EachData<unknown>, _callback?: unknown): void {
    _QUnit.test.skip.each(testName, dataset);
  },
}) as SkipTest;

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
test.todo = Object.assign(function todoTest(testName: string, testContent?: (assert: unknown, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>): void {
  if (!testContent) {
    _QUnit.test.todo(testName, function () {});
    return;
  }
  const meta = { testName, options: {} as unknown, context: {} as Record<string, unknown> };
  _QUnit.test.todo(testName, function (this: Record<string, unknown>, assert: unknown) {
    meta.context = this;
    return testContent.call(this, assert, meta);
  });
}, {
  /** Registers a todo test for each case of `dataset`. Equivalent to `QUnit.test.todo.each`. */
  each<T>(testName: string, dataset: EachData<T>, callback: EachCallback<unknown, T>): void {
    _QUnit.test.todo.each(testName, dataset, buildEachTestScope(callback));
  },
}) as TodoTest<unknown>;

/**
 * Defines a test that runs only when `condition` is truthy, and is skipped otherwise.
 * Equivalent to `QUnit.test.if`.
 *
 * @param {string} testName - Name of the test.
 * @param {unknown} condition - Whether to run the test.
 * @param {function} testContent - Test callback receiving `(assert, { testName, options, context })`.
 */
test.if = Object.assign(function ifTest(testName: string, condition: unknown, testContent: TestContent<unknown>): void {
  test(testName, condition ? {} : { skip: true }, testContent);
}, {
  /** {@linkcode test.each}, run only when `condition` is truthy. Equivalent to `QUnit.test.if.each`. */
  each<T>(testName: string, condition: unknown, dataset: EachData<T>, callback: EachCallback<unknown, T>): void {
    _QUnit.test.if.each(testName, condition, dataset, buildEachTestScope(callback));
  },
}) as IfTest<unknown>;

/**
 * Runs only this test, and any other `only` test or module. Equivalent to
 * `QUnit.test.only`, and to passing `{ only: true }`.
 *
 * @param {string} testName - Name of the test.
 * @param {object} [runtimeOptions] - Optional options, as for {@linkcode test}.
 * @param {function} testContent - Test callback receiving `(assert, { testName, options, context })`.
 */
test.only = Object.assign(function onlyTest(testName: string, runtimeOptionsOrContent: object | TestContent<unknown>, testContent?: TestContent<unknown>): void {
  const [options, content] = testContent
    ? [runtimeOptionsOrContent as object, testContent]
    : [{}, runtimeOptionsOrContent as TestContent<unknown>];
  test(testName, { ...options, only: true }, content);
}, {
  /** {@linkcode test.each}, with every case `only`. Equivalent to `QUnit.test.only.each`. */
  each<T>(testName: string, dataset: EachData<T>, callback: EachCallback<unknown, T>): void {
    _QUnit.test.only.each(testName, dataset, buildEachTestScope(callback));
  },
}) as OnlyTest<unknown>;

/**
 * Defines one test per case of `dataset`, each receiving its case as `data`.
 * Equivalent to `QUnit.test.each`.
 *
 * @param {string} testName - Name shared by the cases.
 * @param {Array|object} dataset - The cases.
 * @param {function} callback - Test body receiving `(assert, data)`.
 */
test.each = function eachTest<T>(testName: string, dataset: EachData<T>, callback: EachCallback<unknown, T>): void {
  _QUnit.test.each(testName, dataset, buildEachTestScope(callback));
};


// QUnit calls a test.each() body with `(assert, data)`; qunitx adds the meta object that
// every test body gets, as on Node.js and Deno, with the case's own name.
function buildEachTestScope<T>(callback: EachCallback<unknown, T>) {
  return function (this: Record<string, unknown>, assert: unknown, data: T) {
    const testName = (QUnit.config.current as { testName: string }).testName;
    return callback.call(this, assert, data, { testName, options: {}, context: this });
  };
}

/** Equivalent to {@linkcode test.only}. */
export const only: typeof test.only = test.only;
/** Equivalent to {@linkcode test.skip}. */
export const skip: typeof test.skip = test.skip;
/** Equivalent to {@linkcode test.todo}. */
export const todo: typeof test.todo = test.todo;

/**
 * Hooks for every test in the run: `QUnit.hooks`, with each hook also receiving
 * `{ context }` as its second argument, as module hooks do.
 */
export const hooks: { beforeEach(fn: HookFn): void; afterEach(fn: HookFn): void } = {
  beforeEach(fn) {
    _QUnit.hooks.beforeEach(function (this: Record<string, unknown>, assert: unknown) {
      return fn.call(this, assert, { context: this });
    });
  },
  afterEach(fn) {
    _QUnit.hooks.afterEach(function (this: Record<string, unknown>, assert: unknown) {
      return fn.call(this, assert, { context: this });
    });
  },
};

/**
 * BDD-style alias for {@linkcode module}. The same function object, so
 * `describe.skip` and `describe.todo` behave exactly like `module.skip` and
 * `module.todo`.
 *
 * @example
 * ```js
 * import { describe, it } from "qunitx";
 *
 * describe("Math", () => {
 *   it("addition", (assert) => {
 *     assert.equal(1 + 1, 2);
 *   });
 * });
 * ```
 */
export const describe: typeof module = module;

/**
 * BDD-style alias for {@linkcode test}. The same function object, so `it.skip`
 * and `it.todo` behave exactly like `test.skip` and `test.todo`.
 *
 * @example
 * ```js
 * import { describe, it } from "qunitx";
 *
 * describe("Math", () => {
 *   it.skip("division is not yet implemented", (assert) => {
 *     assert.equal(4 / 2, 2);
 *   });
 * });
 * ```
 */
export const it: typeof test = test;

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

export default QUnit;
