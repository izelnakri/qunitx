import { compileFunction } from 'node:vm';
import { it } from 'node:test';
import type Assert from '../shared/assert.ts';
import ModuleContext from '../shared/module-context.ts';
import TestContext from '../shared/test-context.ts';

const QUNITX_DIST_URL = new URL('../', import.meta.url).href;

// Walks the JS stack above `stopAt`, returning the first non-node/non-qunitx frame.
// V8 lazily calls prepareStackTrace when .stack is accessed, so we swap it briefly.
function captureCallerLocation(stopAt: (...args: never[]) => unknown): { file: string; line: number } | null {
  const saved = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, frames) => frames;
  const obj = {} as { stack: NodeJS.CallSite[] };
  Error.captureStackTrace(obj, stopAt);
  const { stack } = obj;
  Error.prepareStackTrace = saved;
  for (const f of stack) {
    const file = f.getFileName(), line = f.getLineNumber();
    if (file && !file.startsWith('node:') && !file.startsWith(QUNITX_DIST_URL) && line != null) return { file, line };
  }
  return null;
}

// Calls it() via a tiny vm thunk attributed to `loc` so node:test's C++ stack
// walker (getCallerLocation) sees the user's file/line, not qunitx's wrapper.
function itAt(name: string, opts: object, fn: () => void | Promise<void>, loc: { file: string; line: number } | null): void {
  if (!loc) return void (it as unknown as (...args: unknown[]) => void)(name, opts, fn);
  (compileFunction('return it_(n,o,f)', ['it_', 'n', 'o', 'f'], { filename: loc.file, lineOffset: loc.line - 1 }) as unknown as (...args: unknown[]) => void)(it, name, opts, fn);
}

/**
 * Defines an individual test within a module for Node's built-in test runner.
 *
 * Wraps `it()` from `node:test` and handles the full QUnit lifecycle:
 * beforeEach/afterEach hooks, async assertion waiting, and step verification.
 *
 * Must be called inside a `module()` callback.
 *
 * @param {string} testName - Name of the test.
 * @param {object} [runtimeOptions] - Optional Node test runner options forwarded to `it()`.
 *   Use `{ skip: true | string }` to skip the test, `{ todo: true | string }` to mark it as todo.
 *   Other Node options like `{ concurrency: true }` or `{ timeout: 5000 }` are forwarded as-is.
 * @param {function} testContent - Test callback receiving `(assert, { testName, options, context })`.
 *   `context` is the per-test environment — inherits properties set by `before`/`beforeEach` hooks,
 *   and is the same object as `this` in regular-function callbacks. Useful when using arrow functions.
 * @returns {void}
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
export default function test(testName: string, testContent: (assert: Assert, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>): void;
/** Defines an individual test with optional Node test runner options forwarded to `it()`. */
export default function test(testName: string, runtimeOptions: object, testContent: (assert: Assert, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>): void;
export default function test(
  testName: string,
  runtimeOptions: object | ((assert: Assert, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>),
  testContent?: (assert: Assert, meta: { testName: string; options: unknown; context: Record<string, unknown> }) => void | Promise<void>,
): void {
  const loc = captureCallerLocation(test);
  const moduleContext = ModuleContext.lastModule;
  if (!moduleContext) {
    throw new Error(`Test '${testName}' called outside of module context.`);
  }

  const targetRuntimeOptions = testContent ? runtimeOptions as object : {};
  const { skip, todo } = targetRuntimeOptions as { skip?: boolean | string; todo?: boolean | string };

  // skip: no TestContext — finish() would fire "0 assertions" from afterAll otherwise.
  if (skip) {
    itAt(testName, { skip }, async function () {}, loc);
    return;
  }

  const targetTestContent = (testContent ?? runtimeOptions) as (assert: Assert, meta: { testName: string; options: unknown }) => void | Promise<void>;
  const context = new TestContext(testName, moduleContext);

  // Each test gets a fresh plain object inheriting from the module's user context.
  // This matches QUnit's prototype-chain model: before() sets props on the module context,
  // tests inherit them, and each test's own writes don't pollute sibling tests.
  const userContext = Object.create(moduleContext.userContext);
  context.userContext = userContext;

  // todo: exclude from finish() loop — todo tests may have zero or failing assertions.
  // Node's { todo } on it() handles the result; we just prevent afterAll from calling finish().
  if (todo) moduleContext.tests.pop();

  itAt(testName, { ...targetRuntimeOptions }, function () {
    const { promise, resolve, reject } = Promise.withResolvers<void>();
    context.rejectTimeout = reject;

    const hookMeta = { context: userContext };

    (async () => {
      try {
        for (const mod of context.module!.moduleChain) {
          for (const hook of mod.beforeEachHooks) {
            await hook.call(userContext, context.assert!, hookMeta);
          }
        }

        await targetTestContent.call(userContext, context.assert!, { testName, options: targetRuntimeOptions, context: userContext });

        await context.assert!.waitForAsyncOps();

        for (const mod of context.module!.moduleChain.toReversed()) {
          for (const hook of mod.afterEachHooks.toReversed()) {
            await hook.call(userContext, context.assert!, hookMeta);
          }
        }

        resolve();
      } catch (err) {
        reject(err);
      } finally {
        context.clearTimeoutHandle();
      }
    })();

    return promise;
  }, loc);
}

/**
 * Registers a skipped test. Equivalent to `QUnit.test.skip`.
 * The test body is never executed; reported as skipped by Node's runner.
 *
 * @param {string} testName - Name of the test to skip.
 * @param {function} [_testContent] - Optional body (ignored — the test will not run).
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
test.skip = function skipTest(testName: string, _testContent?: unknown): void {
  itAt(testName, { skip: true }, async function () {}, captureCallerLocation(skipTest));
};

/**
 * Registers a todo test. Equivalent to `QUnit.test.todo`.
 * If a body is provided it runs, but failing assertions do not fail the suite.
 * Node reports the test with a `# TODO` marker. The callback is optional.
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
test.todo = function todoTest(testName: string, testContent?: (assert: Assert, meta: { testName: string; options: unknown }) => void | Promise<void>): void {
  if (!testContent) {
    itAt(testName, { todo: true }, async function () {}, captureCallerLocation(todoTest));
    return;
  }
  test(testName, { todo: true }, testContent);
};
