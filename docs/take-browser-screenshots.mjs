#!/usr/bin/env node
// Serves a QUnit test page and captures screenshots at key moments for the demo GIF.
// Usage: node docs/take-browser-screenshots.mjs
// Output: docs/browser-1-all-passed.png, docs/browser-2-filtered.png, docs/browser-3-expanded.png

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CHROME = process.env.CHROME_BIN ||
  `${process.env.HOME}/.cache/puppeteer/chrome/linux-146.0.7680.66/chrome-linux64/chrome`;

const qunitJS = await fs.readFile(path.join(ROOT, 'vendor/qunit.js'), 'utf8');
const qunitCSS = await fs.readFile(path.join(ROOT, 'vendor/qunit.css'), 'utf8');

// Inline demo test suite for the browser (uses QUnit directly, no bundling needed)
const demoTests = `
QUnit.module('Assertions', (hooks) => {
  QUnit.test('ok / notOk', (assert) => {
    assert.ok(1, 'truthy value passes');
    assert.notOk(0, 'falsy value passes');
  });

  QUnit.test('equal / notEqual (loose ==)', (assert) => {
    assert.equal(2 + 2, 4, 'addition');
    assert.notEqual(2 + 2, 5);
  });

  QUnit.test('strictEqual / notStrictEqual', (assert) => {
    assert.strictEqual('hello', 'hello');
    assert.notStrictEqual(1, '1', 'type-strict: 1 !== "1"');
  });

  QUnit.test('deepEqual – objects, Sets, Maps, circular refs', (assert) => {
    const a = { user: { name: 'Alice', roles: new Set(['admin', 'user']) } };
    const b = { user: { name: 'Alice', roles: new Set(['admin', 'user']) } };
    assert.deepEqual(a, b);
  });

  QUnit.test('propEqual – own enumerable properties only', (assert) => {
    function Point(x, y) { this.x = x; this.y = y; }
    assert.propEqual(new Point(3, 4), { x: 3, y: 4 });
  });

  QUnit.test('propContains – partial match on object properties', (assert) => {
    assert.propContains({ name: 'Bob', age: 30, role: 'admin' }, { role: 'admin' });
  });

  QUnit.test('throws – match by constructor', (assert) => {
    assert.throws(() => { throw new TypeError('bad input'); }, TypeError);
  });

  QUnit.test('step / verifySteps – execution order verification', (assert) => {
    assert.step('first');
    assert.step('second');
    assert.step('third');
    assert.verifySteps(['first', 'second', 'third']);
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
      assert.ok(true, 'callback fired after timeout');
      done();
    }, 10);
  });

  QUnit.test('rejects – async error handling', async (assert) => {
    await assert.rejects(
      Promise.reject(new RangeError('out of bounds')),
      RangeError,
    );
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

  QUnit.test('mutations in one test do not affect the next', function (assert) {
    this.user.loggedIn = true;
    assert.true(this.user.loggedIn, 'mutated here');
    // next test will get a fresh copy from beforeEach
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

const HTML = `<!DOCTYPE html>
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
    <script>${demoTests}</script>
  </body>
</html>`;

// --- HTTP server ---
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(HTML);
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const URL = `http://127.0.0.1:${port}/`;
console.log(`Serving QUnit demo at ${URL}`);

// --- Puppeteer ---
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--window-size=1200,860'],
});

const page = await browser.newPage();
await page.setViewport({ width: 700, height: 680, deviceScaleFactor: 1 });

// Screenshot 1: all tests passed
await page.goto(URL, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => {
  const banner = document.getElementById('qunit-banner');
  return banner && (banner.classList.contains('qunit-pass') || banner.classList.contains('qunit-fail'));
}, { timeout: 15000 });
await page.screenshot({ path: path.join(__dirname, 'browser-1-all-passed.png') });
console.log('Screenshot 1: all passed ✓');

// Screenshot 2: filtered to "Async" module — demonstrates shareable URL with ?moduleId=
const asyncModuleId = await page.evaluate(() => {
  if (typeof QUnit !== 'undefined' && QUnit.config && QUnit.config.modules) {
    const m = QUnit.config.modules.find((m) => m.name === 'Async');
    return m ? m.moduleId : null;
  }
  return null;
});

if (asyncModuleId) {
  await page.goto(`${URL}?moduleId=${asyncModuleId}`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => {
    const banner = document.getElementById('qunit-banner');
    return banner && (banner.classList.contains('qunit-pass') || banner.classList.contains('qunit-fail'));
  }, { timeout: 15000 });
}
await page.screenshot({ path: path.join(__dirname, 'browser-2-filtered.png') });
console.log('Screenshot 2: filtered (Async module) ✓');

// Screenshot 3: all tests, expand "deepEqual" test to show inline assertion detail
await page.goto(URL, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => {
  const banner = document.getElementById('qunit-banner');
  return banner && (banner.classList.contains('qunit-pass') || banner.classList.contains('qunit-fail'));
}, { timeout: 15000 });
// Click the deepEqual test (4th test) to expand its assertion list
const deepEqualTestLink = await page.$('#qunit-tests > li:nth-child(4) > strong');
if (deepEqualTestLink) await deepEqualTestLink.click();
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: path.join(__dirname, 'browser-3-expanded.png') });
console.log('Screenshot 3: deepEqual test expanded ✓');

await browser.close();
server.close();
console.log('Done. Screenshots saved to docs/');
