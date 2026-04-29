import { compileFunction } from 'node:vm';

const QUNITX_DIST_URL = new URL('../', import.meta.url).href;

// Walks the JS stack above `stopAt`, returning the first non-node/non-qunitx frame.
// V8 lazily calls prepareStackTrace when .stack is accessed, so we swap it briefly.
export function captureCallerLocation(stopAt: (...args: never[]) => unknown): { file: string; line: number } | null {
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

// Calls `target(name, opts, fn)` from a tiny vm thunk attributed to `loc` so node:test's
// C++ stack walker (getCallerLocation) sees the user's file/line, not qunitx's wrapper.
// Used for both `it()` (test location) and `describe()` (suite location). `target` is
// typed as `unknown` because @types/node gives `it`/`describe` overloaded signatures
// that don't unify with a single concrete type.
export function callAtLocation(
  target: unknown,
  loc: { file: string; line: number } | null,
  name: string,
  opts: object,
  fn: () => void | Promise<void>,
): void {
  type Target = (name: string, opts: object, fn: () => void | Promise<void>) => void;
  const t = target as Target;
  if (!loc) return void t(name, opts, fn);
  (compileFunction(
    'return t(n,o,f)',
    ['t', 'n', 'o', 'f'],
    { filename: loc.file, lineOffset: loc.line - 1 },
  ) as unknown as (t: Target, n: string, o: object, f: () => void | Promise<void>) => void)(t, name, opts, fn);
}
