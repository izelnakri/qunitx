// @ts-nocheck — runtime-specific subprocess APIs (Deno.Command / node:child_process)
import { module, test } from 'qunitx';

if (typeof globalThis['document'] === 'undefined') {
  module('test location attribution', function () {
    test('failing test reports user file location, not qunitx dist', async function (assert) {
      const { pathname } = new URL('./helpers/failing-location-fixture.ts', import.meta.url);
      const helperPath = process.platform === 'win32' ? pathname.slice(1) : pathname;

      const output = await (async () => {
        if (typeof globalThis['Deno'] !== 'undefined') {
          const result = await new Deno.Command('deno', {
            args: ['test', '--allow-read', '--allow-env', '--no-check', helperPath],
            stdout: 'piped',
            stderr: 'piped',
          }).output();
          return new TextDecoder().decode(result.stdout) + new TextDecoder().decode(result.stderr);
        }
        const cp = 'node:child_process';
        const { spawn } = await import(cp);
        const { NODE_TEST_CONTEXT: _, ...cleanEnv } = process.env;
        const child = spawn('node', ['--test', helperPath], { env: cleanEnv });
        const chunks: Buffer[] = [];
        child.stdout.on('data', (d) => chunks.push(d));
        child.stderr.on('data', (d) => chunks.push(d));
        await new Promise((resolve) => child.on('close', resolve));
        return Buffer.concat(chunks).toString();
      })();

      const fixtureIdx = output.indexOf('failing-location-fixture');
      const distIdx = output.search(/\/qunitx[^/]*\/dist\//);

      assert.ok(
        fixtureIdx !== -1,
        `output should mention the fixture file — got:\n${output.slice(0, 600)}`,
      );
      assert.ok(
        distIdx === -1 || fixtureIdx < distIdx,
        `fixture file should appear before any qunitx dist path — got:\n${output.slice(0, 600)}`,
      );
    });
  });
}
