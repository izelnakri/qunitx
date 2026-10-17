// Node acts on `only` solely when started with `--test-only`, and otherwise prints that
// it needs the flag, which would mislead here: qunitx skips the other tests itself, as
// QUnit does. So `only` reaches describe()/it() only when Node will act on it too.
const NATIVE_ONLY = process.execArgv.includes('--test-only');

/** The runtime options to hand to Node's describe()/it(): a copy, without `only` unless Node honours it. */
export function getNodeRunnerOptions(options: object): object {
  if (NATIVE_ONLY || !('only' in options)) return { ...options };
  const { only: _only, ...rest } = options as { only?: unknown };
  return rest;
}
