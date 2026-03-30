// Minimal Deno global declarations needed to compile shims/deno/ with tsc.
// The actual Deno runtime provides these at runtime.
declare namespace Deno {
  function inspect(
    value: unknown,
    options?: { depth?: number; colors?: boolean; compact?: number | boolean },
  ): string;
}
