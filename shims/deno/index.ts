/**
 * QUnitX — universal test library that runs the same test file in Node.js, Deno, and browser.
 *
 * Wraps QUnit's assertion API over each runtime's native BDD test runner so you only
 * write your tests once.
 *
 * @example
 * ```js
 * import { module, test } from "qunitx";
 *
 * module("Math", (hooks) => {
 *   hooks.before((assert) => assert.step("setup"));
 *
 *   test("addition", (assert) => {
 *     assert.equal(1 + 1, 2);
 *   });
 *
 *   test("async", async (assert) => {
 *     const n = await Promise.resolve(42);
 *     assert.strictEqual(n, 42);
 *   });
 * });
 * ```
 *
 * @module
 */
import '../../vendor/qunit.js';
import { AssertionError as DenoAssertionError } from 'jsr:@std/assert@^1.0.17';
import Assert from '../shared/assert.ts';
import { filterStack } from '../shared/filter-stack.ts';
import ModuleContext from '../shared/module-context.ts';
import TestContext from '../shared/test-context.ts';
import type { AssertionErrorOptions } from '../types.ts';
import Module from './module.ts';
import Test from './test.ts';

/**
 * Thrown when an assertion fails. Extends Deno's built-in `AssertionError`
 * so it integrates cleanly with Deno's test runner output.
 *
 * You rarely construct this directly — assertion methods on {@linkcode Assert}
 * throw it automatically on failure.
 *
 * @example
 * ```js
 * import { AssertionError } from "qunitx";
 *
 * try {
 *   throw new AssertionError({ message: "something went wrong" });
 * } catch (e) {
 *   console.log(e instanceof AssertionError); // true
 * }
 * ```
 */
export class AssertionError extends DenoAssertionError {
  /**
   * Builds an assertion failure, trimming the stack to the caller's frame.
   *
   * @param {object} object - Failure details.
   * @param {string} [object.message] - Failure message; defaults to `"Assertion failed"`.
   * @param {Function} [object.stackStartFn] - Frames at and above this function are cut
   *   from the stack, so the trace starts at the caller's assertion rather than inside
   *   QUnitX.
   */
  constructor(object: AssertionErrorOptions) {
    super(object.message ?? 'Assertion failed');
    if (object.stackStartFn) Error.captureStackTrace(this, object.stackStartFn);
    this.stack = filterStack(this.stack);
  }
}

Assert.QUnit = (globalThis as typeof globalThis & { QUnit: typeof Assert.QUnit }).QUnit;
Assert.AssertionError = AssertionError;
Assert.inspect = Deno.inspect;
ModuleContext.Assert = Assert;
TestContext.Assert = Assert;

Object.freeze(Assert);
Object.freeze(ModuleContext);
Object.freeze(TestContext);

export { Assert };

/**
 * Defines a test module (suite). Wraps Deno's `describe()` and sets up the
 * QUnit lifecycle — `before`, `beforeEach`, `afterEach`, and `after` hooks,
 * assertion counting, and step tracking.
 *
 * Each {@linkcode test} inside the callback receives an {@linkcode Assert} instance.
 * Modules can be nested by calling `module()` inside another module's callback.
 *
 * @param {string} moduleName - Name of the test suite.
 * @param {object} [runtimeOptions] - Optional Deno BDD options forwarded to `describe()`
 *   (e.g. `{ concurrency: false }`, `{ permissions: { read: true } }`).
 * @param {function} moduleContent - Callback that defines tests and hooks.
 *   Receives `(hooks, { moduleName, options })` where `hooks` exposes
 *   `before`, `beforeEach`, `afterEach`, and `after`.
 * @example
 * ```js
 * import { module, test } from "qunitx";
 *
 * module("Math", (hooks) => {
 *   hooks.before((assert) => {
 *     assert.step("before hook ran");
 *   });
 *
 *   test("addition", (assert) => {
 *     assert.equal(2 + 2, 4);
 *   });
 * });
 * ```
 * @example
 * ```js
 * // Nested modules
 * module("Outer", () => {
 *   module("Inner", () => {
 *     test("nested test", (assert) => {
 *       assert.ok(true);
 *     });
 *   });
 * });
 * ```
 */
export { default as module } from './module.ts';

/**
 * BDD-style alias for {@linkcode module}. The same function object, so
 * `describe.skip` and `describe.todo` behave exactly like `module.skip` and
 * `module.todo`.
 *
 * @example
 * ```js
 * import { describe, it } from "qunitx";
 *
 * describe("Math", (hooks) => {
 *   hooks.beforeEach((assert) => {
 *     assert.step("setup");
 *   });
 *
 *   it("adds", (assert) => {
 *     assert.equal(1 + 1, 2);
 *   });
 * });
 * ```
 */
export { default as describe } from './module.ts';

/**
 * BDD-style alias for {@linkcode test}. The same function object, so `it.skip`
 * and `it.todo` behave exactly like `test.skip` and `test.todo`.
 *
 * @example
 * ```js
 * import { describe, it } from "qunitx";
 *
 * describe("Math", () => {
 *   it("adds", (assert) => {
 *     assert.equal(1 + 1, 2);
 *   });
 *
 *   it.skip("divides", (assert) => {
 *     assert.equal(4 / 2, 2);
 *   });
 * });
 * ```
 */
export { default as it } from './test.ts';

/**
 * Registers a skipped test. Equivalent to `test.skip`. The test body is never
 * executed and the test is reported as ignored by Deno's runner.
 *
 * @param {string} testName - Name of the test to skip.
 * @param {function} [_testContent] - Optional body (ignored — the test will not run).
 * @example
 * ```js
 * import { module, skip } from "qunitx";
 *
 * module("Math", () => {
 *   skip("addition is not yet implemented", (assert) => {
 *     assert.equal(1 + 1, 2);
 *   });
 * });
 * ```
 */
export const skip: (testName: string, _testContent?: unknown) => void = Test.skip;

/**
 * Defines an individual test. Wraps Deno's `it()` and handles the full QUnit
 * lifecycle: `beforeEach`/`afterEach` hooks, async assertion waiting, and step
 * verification. Must be called inside a {@linkcode module} callback.
 *
 * The test callback receives `(assert, { testName, options })` where `assert`
 * is an {@linkcode Assert} instance.
 *
 * @param {string} testName - Name of the test.
 * @param {object} [runtimeOptions] - Optional options forwarded to `it()`.
 *   Use `{ skip: true | string }` to skip the test, `{ todo: true | string }` to mark it as todo
 *   (both map to Deno's `{ ignore: true }`). Other Deno BDD options like
 *   `{ concurrency: false }` or `{ sanitizeExit: false }` are forwarded as-is.
 * @param {function} testContent - Test callback receiving `(assert, { testName, options })`.
 * @example
 * ```js
 * import { module, test } from "qunitx";
 *
 * module("Math", () => {
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
export { default as test } from './test.ts';

/**
 * Registers a todo test. Equivalent to `test.todo`. The test body is never executed
 * and the test is reported as ignored by Deno's runner, which has no native todo concept.
 *
 * @param {string} testName - Name of the test to mark as todo.
 * @param {function} [_testContent] - Optional body (ignored — the test will not run).
 * @example
 * ```js
 * import { module, todo } from "qunitx";
 *
 * module("Math", () => {
 *   todo("addition is not yet implemented", (assert) => {
 *     assert.equal(1 + 1, 2);
 *   });
 * });
 * ```
 */
export const todo: (testName: string, _testContent?: unknown) => void = Test.todo;

/**
 * The default export provides the full QUnitX API as a single object.
 *
 * @example
 * ```js
 * import qunitx from "qunitx";
 *
 * qunitx.module("Math", () => {
 *   qunitx.test("addition", (assert) => {
 *     assert.equal(1 + 1, 2);
 *   });
 * });
 * ```
 *
 * @property {Function} module - Defines a test suite. Wraps Deno's `describe()` with
 *   QUnit lifecycle hooks (`before`, `beforeEach`, `afterEach`, `after`).
 *   See the named {@linkcode module} export for full parameter documentation.
 * @property {Function} test - Defines an individual test inside a `module()` callback.
 *   Receives an {@linkcode Assert} instance as its first argument.
 *   See the named {@linkcode test} export for full parameter documentation.
 * @property {Function} describe - BDD-style alias for `module`. Same function object.
 * @property {Function} it - BDD-style alias for `test`. Same function object.
 * @property {typeof AssertionError} AssertionError - The error class thrown when an
 *   assertion fails. Extends Deno's built-in `AssertionError`.
 * @property {object} config - Runtime configuration object (currently unused; reserved
 *   for future QUnit config compatibility).
 */
export default {
  AssertionError: Assert.AssertionError,
  describe: Module,
  it: Test,
  module: Module,
  test: Test,
  config: {},
};

/** Public types referenced by the signatures above, so consumers can name them. */
export type { HookFn, HooksObject, PushResultInfo, TestFn } from '../types.ts';
