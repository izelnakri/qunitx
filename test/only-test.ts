// @ts-nocheck — runtime-specific subprocess APIs (Deno.Command / node:child_process)
import { module, test } from 'qunitx';

// test.only() and module.only() drop every other test in the run, so they are checked
// on a fixture of their own, run as a subprocess. Skipped in the browser (no subprocess API).
const FOCUSED_TESTS = [
  'normal test',
  'test D',
  'test F',
  'test E',
  'test J2',
  'test J3 [0: 1]',
  'test J3 [1: 2]',
];

async function runOnlyFixture(): Promise<{ exitCode: number; output: string }> {
  const { pathname } = new URL('./helpers/only-fixture.ts', import.meta.url);
  const fixturePath = process.platform === 'win32' ? pathname.slice(1) : pathname;

  if (typeof globalThis['Deno'] !== 'undefined') {
    const result = await new Deno.Command('deno', {
      args: ['test', '--allow-read', '--no-check', fixturePath],
      stdout: 'piped',
      stderr: 'piped',
    }).output();
    const output =
      new TextDecoder().decode(result.stdout) + new TextDecoder().decode(result.stderr);
    return { exitCode: result.code, output: output.replace(/\x1b\[[0-9;]*m/g, '') };
  }
  const cp = 'node:child_process';
  const { spawn } = await import(cp);
  const { NODE_TEST_CONTEXT: _, ...cleanEnv } = process.env;
  const child = spawn('node', ['--test', fixturePath], { env: cleanEnv });
  const chunks: Buffer[] = [];
  child.stdout.on('data', (d) => chunks.push(d));
  child.stderr.on('data', (d) => chunks.push(d));
  const exitCode = await new Promise((resolve) => child.on('close', resolve));
  return { exitCode, output: Buffer.concat(chunks).toString() };
}

if (typeof globalThis['document'] === 'undefined') {
  module('only', function () {
    test('runs only the only tests and modules, as QUnit does', async function (assert) {
      // Starts a whole test runner, which takes longer than the 3s default on a slow CI machine.
      assert.timeout(30_000);
      const { exitCode, output } = await runOnlyFixture();

      // Every test the fixture must not run fails if it does, so a clean run is the main check.
      if (typeof globalThis['Deno'] !== 'undefined') {
        // Deno runs only the focused tests, then fails the run on purpose, so that an
        // `only` is not committed by accident.
        assert.notEqual(exitCode, 0, 'Deno fails a run that used only');
        assert.ok(output.includes('Test failed because the "only" option was used'), output);
        assert.ok(/\| 0 failed \|/.test(output), `no test failed:\n${output}`);
        const ran = FOCUSED_TESTS.filter((name) => output.includes(`${name} ... ok`));
        assert.deepEqual(ran, FOCUSED_TESTS, `every focused test ran:\n${output}`);
      } else {
        assert.strictEqual(exitCode, 0, `node --test passes:\n${output}`);
        assert.ok(
          output.includes(`ℹ pass ${FOCUSED_TESTS.length}\n`),
          `only the focused tests passed:\n${output}`,
        );
        assert.ok(output.includes('ℹ fail 0\n'), output);
        assert.notOk(output.includes('--test-only'), 'no notice that only needs --test-only');
      }
    });
  });
}
