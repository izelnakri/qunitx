// Strips runtime-internal frames from an Error's `.stack` so failing-test output
// shows the user's code first and qunitx's wrapper frames second, with no trailing
// pages of `node:internal/test_runner/...` and `node:async_hooks:...` lines.
//
// Filtered prefixes are stable Node-internal modules (their paths haven't
// changed across recent Node versions) and unambiguously not user code. We do
// NOT filter qunitx's own dist frames — they're exactly two short lines per
// failure and are useful when a bug actually lands in qunitx itself.
//
// QUNITX_DEBUG=1 disables filtering entirely, for the rare case where someone
// is debugging qunitx and wants the full V8 stack.
const FILTER_PATTERNS = [
  /\bnode:internal\/test_runner\//,
  /\bnode:async_hooks\b/,
];

function isDebugEnabled(): boolean {
  try {
    const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
    if (proc?.env?.QUNITX_DEBUG === '1') return true;
    const deno = (globalThis as { Deno?: { env?: { get(key: string): string | undefined } } }).Deno;
    if (deno?.env?.get?.('QUNITX_DEBUG') === '1') return true;
  } catch {
    // Deno without --allow-env throws on env access; treat as non-debug.
  }
  return false;
}

export function filterStack(stack: string | undefined): string | undefined {
  if (!stack || isDebugEnabled()) return stack;
  return stack
    .split('\n')
    .filter((line) => !FILTER_PATTERNS.some((p) => p.test(line)))
    .join('\n');
}
