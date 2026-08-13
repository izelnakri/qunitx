declare module 'jsr:@std/assert@^1.0.17' {
  class AssertionError extends Error {
    constructor(message: string, options?: ErrorOptions);
  }
  export { AssertionError };
}
