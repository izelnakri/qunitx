declare module 'jsr:@std/testing/bdd' {
  function describe(name: string, options: Record<string, unknown>, fn: () => void): void;
  function describe(name: string, fn: () => void): void;
  function beforeAll(fn: () => void | Promise<void>): void;
  function afterAll(fn: () => void | Promise<void>): void;
  function it(name: string, options: Record<string, unknown>, fn: (...args: unknown[]) => void | Promise<void>): void;
  function it(name: string, fn: (...args: unknown[]) => void | Promise<void>): void;
  export { describe, beforeAll, afterAll, it };
}
