// Type stub for jsr:@std/testing/bdd. Deno resolves the real module at runtime.
declare module 'jsr:@std/testing/bdd' {
  function describe(name: string, fn: () => void): void;
  function describe(name: string, options: object, fn: () => void): void;
  function it(name: string, options: object, fn: () => void | Promise<void>): void;
  function beforeAll(fn: () => void | Promise<void>): void;
  function afterAll(fn: () => void | Promise<void>): void;
  export { describe, it, beforeAll, afterAll };
}
