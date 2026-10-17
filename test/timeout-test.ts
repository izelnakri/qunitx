// @ts-nocheck — runtime-specific subprocess APIs (Deno.Command / node:child_process)
import { module, test } from 'qunitx';

module('assert.timeout - pass cases', function () {
  test('test completes well within timeout passes normally', async function (assert) {
    assert.timeout(500);
    await new Promise<void>((resolve) => setTimeout(resolve, 10));
    assert.ok(true, 'completed within timeout');
  });

  test('timeout(0) passes a test that finishes synchronously', function (assert) {
    assert.timeout(0);
    assert.ok(true, 'finished synchronously');
  });

  test('calling timeout again resets the deadline', async function (assert) {
    assert.timeout(30);
    assert.timeout(500); // extends the deadline
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
    assert.ok(true, 'completed within the updated timeout');
  });
});

// Subprocess tests: verify the timeout actually fires and kills the test.
// Skipped in the browser (no subprocess API) and gated on document absence.
if (typeof globalThis['document'] === 'undefined') {
  module('assert.timeout - timeout fires', function () {
    test('slow tests are aborted with a timeout error', async function (assert) {
      // Starts a whole test runner, which takes longer than the 3s default on a slow CI machine.
      assert.timeout(30_000);
      // URL.pathname on Windows is '/C:/path' — strip the leading slash to get a valid path.
      const { pathname } = new URL('./helpers/timeout-fires.ts', import.meta.url);
      const helperPath = process.platform === 'win32' ? pathname.slice(1) : pathname;
      let exitCode: number;
      let output: string;

      if (typeof globalThis['Deno'] !== 'undefined') {
        const cmd = new Deno.Command('deno', {
          args: ['test', '--allow-read', '--no-check', helperPath],
          stdout: 'piped',
          stderr: 'piped',
        });
        const result = await cmd.output();
        exitCode = result.code;
        output = new TextDecoder().decode(result.stdout) + new TextDecoder().decode(result.stderr);
      } else {
        const cp = 'node:child_process';
        const { spawn } = await import(cp);
        const { NODE_TEST_CONTEXT: _, ...cleanEnv } = process.env;
        const child = spawn('node', ['--test', helperPath], { env: cleanEnv });
        const chunks: Buffer[] = [];
        child.stdout.on('data', (d) => chunks.push(d));
        child.stderr.on('data', (d) => chunks.push(d));
        exitCode = await new Promise((resolve) => child.on('close', resolve));
        output = Buffer.concat(chunks).toString();
      }

      assert.notEqual(exitCode, 0, 'test runner exits non-zero when timeout fires');
      assert.ok(
        output.includes('Test took longer than 30ms; test timed out.'),
        `assert.timeout(30) should time the first test out — got: ${output.slice(0, 600)}`,
      );
      assert.ok(
        output.includes('Test took longer than 40ms; test timed out.'),
        `config.testTimeout = 40 should time the second test out — got: ${output.slice(0, 600)}`,
      );
    });
  });
}
