/**
 * Runner settings for Node.js and Deno, named after the `QUnit.config` keys they mirror.
 * Each test reads them as it starts, so a change applies to the tests that start after it.
 */
const config: { testTimeout: number } = {
  /**
   * Milliseconds a test may take before it fails as timed out, as `QUnit.config.testTimeout`
   * (3000 by default since QUnit 3.0). `0` disables it; `assert.timeout()` overrides it
   * for one test.
   */
  testTimeout: 3000,
};

export default config;
