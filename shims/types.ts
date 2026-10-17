export interface AssertionErrorOptions {
  message?: string;
  actual?: unknown;
  expected?: unknown;
  operator?: string;
  stackStartFn?: (...args: never[]) => unknown;
}

export type InspectFn = (value: unknown, options?: { depth?: number; colors?: boolean; compact?: boolean | number }) => string;

export interface AssertionErrorConstructor {
  new (options: AssertionErrorOptions): Error;
}

/** Result object passed to {@linkcode Assert.prototype.pushResult}. */
export interface PushResultInfo {
  /** Whether the assertion passed (`true`) or failed (`false`). */
  result?: boolean;
  /** The actual value produced by the code under test. */
  actual?: unknown;
  /** The expected value. */
  expected?: unknown;
  /** Human-readable description of the assertion. */
  message?: string;
}

export interface QUnitObject {
  equiv(a: unknown, b: unknown): boolean;
  config: Record<string, unknown>;
  [key: string]: unknown;
}

/** Minimal assertion-tracking state that Assert reads/writes per test. */
export interface TestState {
  totalExecutedAssertions: number;
  steps: string[];
  /** Steps checked by verifySteps() so far, to explain an expect() count off by exactly those. */
  stepsCount: number;
  asyncOps: Promise<void>[];
  timeout?: number;
  expectedAssertionCount?: number;
  userContext?: Record<string, unknown>;
  module?: { name: string };
  setTimeoutDuration(ms: number): void;
}

/** Minimal module shape that Assert needs to resolve a fallback test context. */
export interface ModuleState {
  testContext: TestState;
}

/** A lifecycle hook callback that receives an {@linkcode Assert} instance and a meta object with the shared context. */
export type HookFn<A = unknown> = (assert: A, meta: { context: Record<string, unknown> }) => void | Promise<void>;
/** A test body: receives an {@linkcode Assert} instance and a meta object naming the test, its runtime options, and the shared context. */
export type TestFn<A = unknown> = (
  assert: A,
  meta: { testName: string; options: unknown; context: Record<string, unknown> },
) => void | Promise<unknown>;

/** Lifecycle hooks available inside a `module()` callback. */
export interface HooksObject<A = unknown> {
  /** Runs once before the first test in the module. */
  before(fn: HookFn<A>): void;
  /** Runs before each test in the module. */
  beforeEach(fn: HookFn<A>): void;
  /** Runs after each test in the module. */
  afterEach(fn: HookFn<A>): void;
  /** Runs once after the last test in the module. */
  after(fn: HookFn<A>): void;
}

/** A test body, as `test()` takes it. */
export type TestContent<A = unknown> = (
  assert: A,
  meta: { testName: string; options: unknown; context: Record<string, unknown> },
) => void | Promise<void>;
/** A `test.each()` dataset: an array of cases, or an object of named cases. */
export type EachData<T> = T[] | Record<string, T>;
/**
 * A `test.each()` body: receives each case as `data`, then the same meta object as any
 * test body (`testName` is the case's own, e.g. `add [2]`), with the test's context as `this`.
 */
export type EachCallback<A, T> = (
  this: Record<string, unknown>,
  assert: A,
  data: T,
  meta: { testName: string; options: unknown; context: Record<string, unknown> },
) => void | Promise<void>;

/** `test.skip()`, and `test.skip.each()`. */
export interface SkipTest {
  (testName: string, testContent?: unknown): void;
  /** Registers a skipped test for each case of `dataset`. */
  each(testName: string, dataset: EachData<unknown>, callback?: unknown): void;
}
/** `test.todo()`, and `test.todo.each()`. */
export interface TodoTest<A = unknown> {
  (testName: string, testContent?: TestContent<A>): void;
  /** Registers a todo test for each case of `dataset`. */
  each<T>(testName: string, dataset: EachData<T>, callback: EachCallback<A, T>): void;
}
/** `test.if()`, and `test.if.each()`. */
export interface IfTest<A = unknown> {
  (testName: string, condition: unknown, testContent: TestContent<A>): void;
  /** `test.each()`, run only when `condition` is truthy. */
  each<T>(testName: string, condition: unknown, dataset: EachData<T>, callback: EachCallback<A, T>): void;
}
/** `test.only()`, and `test.only.each()`. */
export interface OnlyTest<A = unknown> {
  (testName: string, testContent: TestContent<A>): void;
  (testName: string, runtimeOptions: object, testContent: TestContent<A>): void;
  /** `test.each()`, with every case `only`. */
  each<T>(testName: string, dataset: EachData<T>, callback: EachCallback<A, T>): void;
}
