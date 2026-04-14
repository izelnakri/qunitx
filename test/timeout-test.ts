// @ts-nocheck — runtime-specific subprocess APIs (Deno.Command / node:child_process)
import { module, test } from 'qunitx';

module('assert.timeout - pass cases', function () {
  test('test completes well within timeout passes normally', async function (assert) {
    assert.timeout(500);
    await new Promise<void>((resolve) => setTimeout(resolve, 10));
    assert.ok(true, 'completed within timeout');
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
    test('slow test is aborted with a timeout error', async function (assert) {
      const helperPath = new URL('./helpers/timeout-fires.ts', import.meta.url).pathname;
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
        output.includes('timed out'),
        `output should mention "timed out" — got: ${output.slice(0, 400)}`,
      );
    });
  });
}
