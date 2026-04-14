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
- **`assert.timeout(ms)`** — hard deadline per test; the test fails with a descriptive
  message if it doesn't complete in time (all three runtimes)
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

No config file needed. No `jest.config.js`, no `vitest.config.ts`, no setup files — just import and run.
TypeScript is supported natively: pass `.ts` files directly to `node --test` or `deno test`.

---

## Quick start

```ts
// math-test.ts  (works in Node, Deno, and browser unchanged)
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
node --test math-test.ts

# Watch mode (re-runs on save)
node --test --watch math-test.ts

# Glob pattern
node --test --watch 'test/**/*.ts'

# Code coverage
npx c8 node --test math-test.ts
```

### Deno

```sh
# Install qunitx once (same command as Node)
npm install qunitx --save-dev

# Run
deno test math-test.ts

# With explicit permissions
deno test --allow-read --allow-env math-test.ts
```

For Deno-only projects without a `package.json`, use an import map instead:

```sh
echo '{"imports": {"qunitx": "npm:qunitx"}}' > deno.json
deno test math-test.ts
```

### Browser

Use [qunitx-cli](https://github.com/izelnakri/qunitx-cli) to get browser test output
in your terminal / CI, or to open the live QUnit UI during development:

```sh
npm install -g qunitx-cli

# Headless (CI-friendly — outputs TAP to stdout)
qunitx math-test.ts

# Open QUnit browser UI alongside terminal output
qunitx math-test.ts --debug
```

The browser UI lets you:
- Filter by module or test name (filter state is preserved in the URL)
- Share a link that reproduces the exact filtered view with a colleague
- Re-run individual tests by clicking them
- See full assertion diffs inline

> **All browser runner options are documented in [qunitx-cli](https://github.com/izelnakri/qunitx-cli).**
> This includes: `test.html` (optional custom HTML template), watch mode, `--port`,
> `--browser` (chromium / firefox / webkit), `--failFast`, `--timeout`,
> `--before` / `--after` lifecycle hooks, and more.

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

## QUnit compatibility

qunitx follows the same test-environment model as QUnit:

- **Fresh context per test** — each test gets its own `this` object. Writes in one test never bleed into a sibling.
- **Prototype-chain inheritance** — a parent module's `before()` hook sets properties on the module context. Each test inherits those properties, so reads work naturally (`this.x`) while writes stay local to the test.
- **`before()` assertions** — attributed to the first test in the module (matching QUnit's attribution model).
- **`after()` assertions** — attributed to the last test in the module.
- **Hook ordering** — `before`/`beforeEach` run FIFO; `afterEach`/`after` run LIFO, exactly as in QUnit.

> **Known difference:** In QUnit's browser runner, `before()` hook assertions are attributed to the first test in the *entire subtree* (including nested modules). In the Node/Deno adapters, they are attributed to the first *direct* test of the module. In the common case where direct tests appear before nested modules, the behavior is identical.

### `context` — arrow-function-friendly shared state

QUnit exposes the shared test context as `this` inside hooks and test bodies. This works with regular functions but not with arrow functions, since arrow functions capture `this` lexically from the surrounding scope.

QUnitX adds `context` to the meta second argument of every hook and test callback. It points to the same shared object as `this`, so you can use whichever style you prefer:

```js
// QUnit style — regular functions, uses `this`
module('Suite', function (hooks) {
  hooks.before(function () { this.db = createDb(); });
  hooks.afterEach(function (assert) { this.db.reset(); });

  test('query', function (assert) {
    assert.ok(this.db.query('SELECT 1'));
  });
});

// QUnitX style — arrow functions, uses `context`
module('Suite', (hooks, { context }) => {
  context.shared = 'module-level value';

  hooks.before((assert, { context }) => { context.db = createDb(); });
  hooks.afterEach((assert, { context }) => { context.db.reset(); });

  test('query', (assert, { context }) => {
    assert.ok(context.db.query('SELECT 1'));
  });
});
```

Context inheritance follows QUnit's prototype-chain model regardless of which style you use: `before()` writes are visible to all tests in the module; each test's own writes stay local to that test.

---

## Skip and todo

Mark individual tests or entire modules as skipped or pending:

```js
import { module, test } from 'qunitx';

module('Suite', () => {
  // Skip a single test — body never runs
  test.skip('not yet implemented', (assert) => {
    assert.ok(false); // never executes
  });

  // todo — body runs but failures do not fail the suite
  test.todo('multiplication', (assert) => {
    assert.equal(2 * 3, 6);
  });

  // todo with no body — registers the test as pending
  test.todo('division');

  // Skip via runtime options (useful for conditional or cross-runtime skipping)
  test('flaky on CI', { skip: true }, (assert) => { assert.ok(true); });
  test('not ready', { todo: 'needs implementation' }, (assert) => { assert.ok(false); });
});

// Skip or todo an entire module
module.skip('Legacy API', () => {
  test('old behaviour', (assert) => { assert.ok(false); }); // never runs
});

module.todo('Future features', () => {
  test('planned', (assert) => { assert.ok(false); }); // never runs
});
```

Top-level `skip` and `todo` aliases are also exported for QUnit-style usage:

```js
import { module, test, skip, todo } from 'qunitx';

module('Suite', () => {
  skip('skipped test', (assert) => { assert.ok(false); });
  todo('pending test', (assert) => { assert.ok(false); });
});
```

> **Node vs. Deno behaviour:** Node's `test.todo` runs the body but does not count failures
> against the suite. Deno has no native todo concept and maps both `skip` and `todo` to
> "ignored" — the body does not run.

---

## Timeouts

```js
test('slow async operation', async (assert) => {
  assert.timeout(500); // fail after 500 ms if not complete

  const result = await fetchSomething();
  assert.ok(result);
});

test('adjustable deadline', async (assert) => {
  assert.timeout(100);
  assert.timeout(500); // calling again resets the deadline
  await doWork();
  assert.ok(true);
});
```

`assert.timeout(ms)` sets a hard deadline for the current test. If the test does not complete
within `ms` milliseconds the runner aborts it with a descriptive error message.

`assert.timeout()` works across all three runtimes. In Node.js and Deno it is handled by
qunitx's internal deadline mechanism; in the browser it delegates to QUnit's native
`assert.timeout()` (available since QUnit 2.16).

---

## Concurrency

Tests run **sequentially by default** — matching QUnit's browser behavior where tests run one at a time. You can enable concurrency by passing options to the underlying Node / Deno runner:

```js
import { module, test } from 'qunitx';

// Enable parallel execution for this module (Node/Deno only)
module('Parallel suite', { concurrency: true }, (hooks) => {
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

qunitx loads as a regular dependency rather than wrapping the runtime process, so
Node.js and Deno's built-in v8 coverage instruments it naturally — no special configuration needed.

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
- [qunitx-cli](https://github.com/izelnakri/qunitx-cli) — browser runner, CI reporter, and all HTML/runner configuration options
- [Node.js test runner docs](https://nodejs.org/api/test.html)
- [Deno testing docs](https://docs.deno.com/runtime/fundamentals/testing/)
