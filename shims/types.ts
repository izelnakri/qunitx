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
