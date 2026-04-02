declare module 'jsr:@std/assert' {
  class AssertionError extends Error {
    constructor(message: string, options?: ErrorOptions);
  }
  export { AssertionError };
}
