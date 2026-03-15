<div align="center">

# QUnitX

[![CI](https://github.com/izelnakri/qunitx/actions/workflows/ci.yml/badge.svg)](https://github.com/izelnakri/qunitx/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/izelnakri/qunitx/branch/main/graph/badge.svg)](https://codecov.io/gh/izelnakri/qunitx)
[![npm](https://img.shields.io/npm/v/qunitx)](https://www.npmjs.com/package/qunitx)
[![npm downloads](https://img.shields.io/npm/dm/qunitx)](https://www.npmjs.com/package/qunitx)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Ask me anything](https://img.shields.io/badge/ask%20me-anything-1abc9c.svg)](https://github.com/izelnakri/qunitx/issues)
[![Sponsor](https://img.shields.io/badge/sponsor-%E2%99%A5-pink)](https://github.com/sponsors/izelnakri)

</div>

**The oldest, most battle-tested JavaScript test API — now universal.**

Run the **same test file** in Node.js, Deno, and the browser without changes.
Zero dependencies. No config needed for Node. TypeScript works out of the box.

---

## Why QUnit?

QUnit was created in 2008 by the jQuery team. While newer frameworks come and go,
QUnit has quietly accumulated 16+ years of real-world edge-case handling that younger
tools are still catching up to. Its assertion API is the most mature in the JavaScript
ecosystem:

- **`assert.deepEqual`** — handles circular references, prototype chains, Sets, Maps,
  typed arrays, Dates, RegExps, and getters correctly
- **`assert.throws` / `assert.rejects`** — match errors by constructor, regex, or custom validator
- **`assert.step` / `assert.verifySteps`** — declarative execution-order verification;
  catches missing async callbacks that other frameworks silently swallow
- **`assert.expect(n)`** — fails the test if exactly _n_ assertions didn't run;
  invaluable for async code where missing assertions would otherwise pass silently
- **Hooks** — `before`, `beforeEach`, `afterEach`, `after` with correct FIFO/LIFO ordering,
  properly scoped across nested modules
- **Shareable browser URLs** — the QUnit browser UI filters tests via query params, so you can
  share `https://yourapp.test/?moduleId=abc123` with a colleague and they see exactly the same view

QUnitX wraps this API to work with **Node.js's built-in `node:test` runner** and
**Deno's native test runner** — no Jest, Vitest, or other framework needed.

QUnit includes the fastest assertion and test runtime in JS world. I've previously contributed to some [speed optimizations](https://qunitjs.com/blog/2022/02/15/qunit-2-18-0/) to QUnit, we benchmark every possible thing to make it the fastest test
runtime, faster than node.js and deno default assertions in most cases. Therefore I consider myself very objective
when I say QUnit(X) is the best JS/TS testing tool out there.

---

## Demo

> Left window: `node --test` and `deno test` running the same file.
> Right window: QUnit browser UI with filterable, shareable test results.

<!-- Demo GIF: see docs/demo.tape (VHS script) for terminal portion.
     For the combined terminal + browser recording, see "Recording the demo" below. -->
![QUnitX demo](https://raw.githubusercontent.com/izelnakri/qunitx/main/docs/demo.gif)

Live browser UI example (click to see filterable QUnit test suite):

[objectmodel.js.org/test/?moduleId=6e15ed5f](https://objectmodel.js.org/test/?moduleId=6e15ed5f&moduleId=950ec9c5)

---

## Installation

```sh
npm install qunitx --save-dev
```

Requires **Node.js >= 22** (LTS) or **Deno >= 2**.

---

## Quick start

```js
// math-test.js  (works in Node, Deno, and browser unchanged)
import { module, test } from 'qunitx';

module('Math utilities', (hooks) => {
  hooks.before((assert) => {
    assert.step('setup complete');
  });

  test('addition', (assert) => {
    assert.equal(2 + 2, 4);
    assert.notEqual(2 + 2, 5);
  });

  test('deepEqual', (assert) => {
    assert.deepEqual({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] });
  });

  module('Async', () => {
    test('resolves correctly', async (assert) => {
      const result = await Promise.resolve(42);
      assert.strictEqual(result, 42);
    });
  });
});
```

### Node.js

```sh
# No extra dependencies — uses the Node built-in test runner
node --test math-test.js

# Watch mode (re-runs on save)
node --test --watch math-test.js

# Glob pattern
node --test --watch 'test/**/*.js'

# TypeScript (tsconfig.json with moduleResolution: NodeNext required)
node --import=tsx/esm --test math-test.ts

# Code coverage
npx c8 node --test math-test.js
```

### Deno

```sh
# One-time: create a deno.json import map
echo '{"imports": {"qunitx": "https://esm.sh/qunitx/shims/deno/index.js"}}' > deno.json

# Run
deno test math-test.js

# With explicit permissions
deno test --allow-read --allow-env math-test.js
```

### Browser

Use [qunitx-cli](https://github.com/izelnakri/qunitx-cli) to get browser test output
in your terminal / CI, or to open the live QUnit UI during development:

```sh
npm install -g qunitx-cli

# Headless (CI-friendly — outputs TAP to stdout)
qunitx math-test.js

# Open QUnit browser UI alongside terminal output
qunitx math-test.js --debug
```

The browser UI lets you:
- Filter by module or test name (filter state is preserved in the URL)
- Share a link that reproduces the exact filtered view with a colleague
- Re-run individual tests by clicking them
- See full assertion diffs inline

---

## Migrating from QUnit

One import line is all that changes:

```js
// Before:
import { module, test } from 'qunit';

// After:
import { module, test } from 'qunitx';
```

---

## Concurrency options

`module()` and `test()` accept an optional options object forwarded directly to the underlying
Node / Deno test runner:

```js
import { module, test } from 'qunitx';

// Run tests in this module serially
module('Serial suite', { concurrency: false }, (hooks) => {
  test('first', (assert) => { assert.ok(true); });
  test('second', (assert) => { assert.ok(true); });
});

// Deno-specific: permissions, sanitizeExit, etc.
module('Deno file access', { permissions: { read: true }, sanitizeExit: false }, (hooks) => {
  test('reads a file', async (assert) => {
    const text = await Deno.readTextFile('./README.md');
    assert.ok(text.length > 0);
  });
});
```

---

## How it works

| Runtime | Adapter |
|---------|---------|
| Node.js | Wraps `node:test` `describe` / `it` with QUnit lifecycle |
| Deno | Wraps Deno BDD helpers with the same QUnit lifecycle |
| Browser | Thin re-export of QUnit's native browser API |

The browser path is literally QUnit itself, so you get full QUnit compatibility:
plugins, custom reporters, the event API (`QUnit.on`, `QUnit.done`, etc.), and the
familiar browser UI with zero extra layers.

---

## Code coverage

Probably c8 isn't even needed since qunitx runs as a dependency(rather than runtime) on node.js and deno.

```sh
# Node (any c8-compatible reporter)
npx c8 node --test test/

# View HTML report
npx c8 --reporter=html node --test test/ && open coverage/index.html
```

Browser-mode coverage is limited because qunitx-cli bundles test files with esbuild.
Native ES import maps support in Puppeteer/Chrome would eliminate the bundling step
and unlock v8 instrumentation for browser coverage.

---

## Links

- [QUnit API reference](https://api.qunitjs.com)
- [qunitx-cli](https://github.com/izelnakri/qunitx-cli) — browser runner / CI reporter
- [Node.js test runner docs](https://nodejs.org/api/test.html)
- [Deno testing docs](https://docs.deno.com/runtime/fundamentals/testing/)
