// @ts-nocheck — runtime-specific subprocess APIs (Deno.Command / node:child_process)
import { module, test } from 'qunitx';

async function runFailingFixture(extraEnv: Record<string, string> = {}): Promise<string> {
  const { pathname } = new URL('./helpers/failing-location-fixture.ts', import.meta.url);
  const helperPath = process.platform === 'win32' ? pathname.slice(1) : pathname;

  if (typeof globalThis['Deno'] !== 'undefined') {
    const result = await new Deno.Command('deno', {
      args: ['test', '--allow-read', '--allow-env', '--no-check', helperPath],
      stdout: 'piped',
      stderr: 'piped',
      env: extraEnv,
    }).output();
    return new TextDecoder().decode(result.stdout) + new TextDecoder().decode(result.stderr);
  }
  const cp = 'node:child_process';
  const { spawn } = await import(cp);
  const { NODE_TEST_CONTEXT: _, ...cleanEnv } = process.env;
  const child = spawn('node', ['--test', helperPath], { env: { ...cleanEnv, ...extraEnv } });
  const chunks: Buffer[] = [];
  child.stdout.on('data', (d) => chunks.push(d));
  child.stderr.on('data', (d) => chunks.push(d));
  await new Promise((resolve) => child.on('close', resolve));
  return Buffer.concat(chunks).toString();
}

if (typeof globalThis['document'] === 'undefined') {
  module('failing-test output', function () {
    test('reports user file location, not qunitx dist', async function (assert) {
      const output = await runFailingFixture();

      // Match both `/` and `\` separators so this runs on Windows too — the
      // previous Linux-only regex silently passed even when the suite location
      // pointed at qunitx's dist/node/module.js.
      const BAD_PATH = /qunitx[/\\]dist[/\\]/;

      assert.ok(
        output.includes('failing-location-fixture'),
        `output should mention the fixture file — got:\n${output.slice(0, 800)}`,
      );

      // Node TAP output emits `location: '<file>:<line>:<col>'` for both the
      // test and its containing suite. Both must point at the user's fixture,
      // not qunitx's wrapper modules. This is the regression that surfaced on
      // Windows CI as `test at node_modules\qunitx\dist\node\module.js:13:3`
      // — the suite's describe() call had no location attribution.
      // Deno's reporter has no equivalent line (the regex finds nothing); the
      // fixture-name check above is enough there.
      const reportedLocations = [...output.matchAll(/location:\s*['"]([^'"]+)['"]/g)].map(
        (m) => m[1]!,
      );
      const badLocations = reportedLocations.filter((loc) => BAD_PATH.test(loc));
      assert.deepEqual(
        badLocations,
        [],
        `no reported location should point inside qunitx/dist — got bad locations: ${JSON.stringify(badLocations)}\nfull output:\n${output.slice(0, 800)}`,
      );
    });

    test('strips node:internal test-runner frames from the assertion stack', async function (assert) {
      // Node-only check: Deno's failing-test output doesn't reach into Node-internal
      // modules, so there's nothing to filter on Deno (the filter is a no-op there).
      if (typeof globalThis['Deno'] !== 'undefined') {
        assert.ok(true, 'skipped on Deno — Node-internal frames do not appear in Deno output');
        return;
      }

      const output = await runFailingFixture();
      assert.ok(
        output.includes('failing-location-fixture'),
        `output should mention the fixture file — got:\n${output.slice(0, 800)}`,
      );
      assert.notOk(
        /\bnode:internal\/test_runner\//.test(output),
        `failing test stack should not include node:internal/test_runner frames — got:\n${output.slice(0, 800)}`,
      );
      assert.notOk(
        /\bnode:async_hooks\b/.test(output),
        `failing test stack should not include node:async_hooks frames — got:\n${output.slice(0, 800)}`,
      );

      // Sanity check: with QUNITX_DEBUG=1 the filter is bypassed, so the noisy
      // frames return. This guards against silently disabling filtering in
      // future refactors (e.g. accidentally always reading some other env var).
      const debugOutput = await runFailingFixture({ QUNITX_DEBUG: '1' });
      assert.ok(
        /\bnode:internal\/test_runner\//.test(debugOutput),
        `QUNITX_DEBUG=1 should bypass filtering and surface the original frames — got:\n${debugOutput.slice(0, 800)}`,
      );
    });
  });
}
