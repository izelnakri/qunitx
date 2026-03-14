#!/usr/bin/env node
// Serves QUnit test pages and captures screenshots for the demo GIF.
// Usage: CHROME_BIN=... node docs/take-browser-screenshots.mjs
// Output: docs/browser-{1-failing,2-all-passed,3-filtered,4-expanded}.png

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CHROME =
  process.env.CHROME_BIN ||
  `${process.env.HOME}/.cache/puppeteer/chrome/linux-146.0.7680.66/chrome-linux64/chrome`;

const qunitJS = await fs.readFile(path.join(ROOT, 'vendor/qunit.js'), 'utf8');
const qunitCSS = await fs.readFile(path.join(ROOT, 'vendor/qunit.css'), 'utf8');

// ── Shared test suite ────────────────────────────────────────────────────────
// Bug is in deepEqual: scores[1] is 87 in "actual" but 88 in "expected".
// Swap BUGGY_VALUE → FIXED_VALUE to simulate saving the fix.
const BUGGY_VALUE = '87';
const FIXED_VALUE = '88';

const makeSuite = (scoreValue) => `
QUnit.module('Assertions', (hooks) => {
  QUnit.test('ok / notOk', (assert) => {
    assert.ok(1, 'truthy value passes');
    assert.notOk(0, 'falsy value passes');
  });

  QUnit.test('equal / strictEqual', (assert) => {
    assert.equal(2 + 2, 4, 'addition');
    assert.strictEqual('hello', 'hello');
  });

  QUnit.test('deepEqual – user profile sync', (assert) => {
    const response = { user: { name: 'Alice', scores: [95, ${scoreValue}, 92] }, active: true };
    const expected = { user: { name: 'Alice', scores: [95, 88, 92] }, active: true };
    assert.deepEqual(response, expected, 'API response matches expected shape');
  });

  QUnit.test('throws – match by constructor', (assert) => {
    assert.throws(() => { throw new TypeError('bad input'); }, TypeError);
  });

  QUnit.test('propContains – partial object match', (assert) => {
    assert.propContains({ id: 1, name: 'Alice', role: 'admin' }, { role: 'admin' });
  });
});

QUnit.module('Async', (hooks) => {
  QUnit.test('async/await', async (assert) => {
    const result = await Promise.resolve(42);
    assert.strictEqual(result, 42, 'resolved to 42');
  });

  QUnit.test('assert.async() – callback style', (assert) => {
    const done = assert.async();
    setTimeout(() => {
      assert.ok(true, 'callback fired');
      done();
    }, 10);
  });

  QUnit.test('rejects – async error handling', async (assert) => {
    await assert.rejects(Promise.reject(new RangeError('out of bounds')), RangeError);
  });
});

QUnit.module('Hooks', (hooks) => {
  hooks.beforeEach(function () {
    this.user = { name: 'Alice', loggedIn: false };
  });

  QUnit.test('beforeEach sets up fresh state', function (assert) {
    assert.strictEqual(this.user.name, 'Alice');
    assert.false(this.user.loggedIn, 'starts logged out');
  });

  QUnit.test('mutations do not leak between tests', function (assert) {
    this.user.loggedIn = true;
    assert.true(this.user.loggedIn, 'mutated in this test only');
  });

  QUnit.module('Nested Hooks', (innerHooks) => {
    innerHooks.beforeEach(function () {
      this.role = 'admin';
    });

    QUnit.test('inner beforeEach stacks on outer', function (assert) {
      assert.strictEqual(this.user.name, 'Alice', 'outer beforeEach ran');
      assert.strictEqual(this.role, 'admin', 'inner beforeEach also ran');
    });
  });
});
`;

const makeHTML = (tests) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>QUnitX Demo Tests</title>
    <style>${qunitCSS}</style>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      #qunit-header { background: #1c1c1e; }
    </style>
  </head>
  <body>
    <div id="qunit"></div>
    <div id="qunit-fixture"></div>
    <script>${qunitJS}</script>
    <script>${tests}</script>
  </body>
</html>`;

// ── Helpers ──────────────────────────────────────────────────────────────────
function createServer(html) {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function waitForResults(page, timeout = 15000) {
  await page.waitForFunction(
    () => {
      const banner = document.getElementById('qunit-banner');
      return (
        banner &&
        (banner.classList.contains('qunit-pass') || banner.classList.contains('qunit-fail'))
      );
    },
    { timeout },
  );
}

// ── Puppeteer ────────────────────────────────────────────────────────────────
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--window-size=1200,860'],
});

const page = await browser.newPage();
await page.setViewport({ width: 700, height: 680, deviceScaleFactor: 1 });

// ── Screenshot 1: Failing tests — deepEqual diff visible ─────────────────────
const failingServer = await createServer(makeHTML(makeSuite(BUGGY_VALUE)));
const failingURL = `http://127.0.0.1:${failingServer.address().port}/`;
console.log(`Serving failing tests at ${failingURL}`);

await page.goto(failingURL, { waitUntil: 'networkidle0' });
await waitForResults(page);

// Expand the failing test so the deepEqual diff is in view
const failingItem = await page.$('#qunit-tests > li.fail');
if (failingItem) {
  const toggle = await failingItem.$('strong');
  if (toggle) {
    await toggle.click();
    await new Promise((r) => setTimeout(r, 600));
  }
  // Scroll the failing test to the top so diff is fully visible
  await page.evaluate((el) => el.scrollIntoView({ block: 'start' }), failingItem);
  await new Promise((r) => setTimeout(r, 300));
}

await page.screenshot({ path: path.join(__dirname, 'browser-1-failing.png') });
console.log('Screenshot 1: failing (deepEqual diff) ✓');
failingServer.close();

// ── Screenshot 2: All passing — simulates browser refresh after fixing the bug ──
const passingServer = await createServer(makeHTML(makeSuite(FIXED_VALUE)));
const passingURL = `http://127.0.0.1:${passingServer.address().port}/`;
console.log(`Serving passing tests at ${passingURL}`);

await page.goto(passingURL, { waitUntil: 'networkidle0' });
await waitForResults(page);
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: path.join(__dirname, 'browser-2-all-passed.png') });
console.log('Screenshot 2: all passed ✓');

// ── Screenshot 3: Filtered to "Async" module — shareable URL demo ────────────
const asyncModuleId = await page.evaluate(() => {
  if (typeof QUnit !== 'undefined' && QUnit.config && QUnit.config.modules) {
    const m = QUnit.config.modules.find((m) => m.name === 'Async');
    return m ? m.moduleId : null;
  }
  return null;
});

if (asyncModuleId) {
  await page.goto(`${passingURL}?moduleId=${asyncModuleId}`, { waitUntil: 'networkidle0' });
  await waitForResults(page);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: path.join(__dirname, 'browser-3-filtered.png') });
console.log('Screenshot 3: filtered (Async module) ✓');

// ── Screenshot 4: Back to all tests, deepEqual test expanded ─────────────────
await page.goto(passingURL, { waitUntil: 'networkidle0' });
await waitForResults(page);

// Expand the deepEqual test (3rd test in Assertions) to show passing assertion detail
const deepEqualItem = await page.$('#qunit-tests > li:nth-child(3)');
if (deepEqualItem) {
  const toggle = await deepEqualItem.$('strong');
  if (toggle) {
    await toggle.click();
    await new Promise((r) => setTimeout(r, 400));
  }
  await page.evaluate((el) => el.scrollIntoView({ block: 'start' }), deepEqualItem);
  await new Promise((r) => setTimeout(r, 200));
}
await page.screenshot({ path: path.join(__dirname, 'browser-4-expanded.png') });
console.log('Screenshot 4: deepEqual expanded (passing) ✓');

passingServer.close();
await browser.close();
console.log('Done. Screenshots saved to docs/');
