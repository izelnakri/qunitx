<div align="center">

# QUnitX

**One test file. Node.js, Deno, and the browser. No config.**

[![CI](https://github.com/izelnakri/qunitx/actions/workflows/ci.yml/badge.svg)](https://github.com/izelnakri/qunitx/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/izelnakri/qunitx/branch/main/graph/badge.svg)](https://codecov.io/gh/izelnakri/qunitx)
[![npm](https://img.shields.io/npm/v/qunitx)](https://www.npmjs.com/package/qunitx)
[![JSR](https://jsr.io/badges/@izelnakri/qunitx)](https://jsr.io/@izelnakri/qunitx)
[![JSR score](https://jsr.io/badges/@izelnakri/qunitx/score)](https://jsr.io/@izelnakri/qunitx)
[![npm downloads](https://img.shields.io/npm/dm/qunitx)](https://www.npmjs.com/package/qunitx)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Sponsor](https://img.shields.io/badge/sponsor-%E2%99%A5-pink)](https://github.com/sponsors/izelnakri)

![QUnitX demo](https://raw.githubusercontent.com/izelnakri/qunitx/main/docs/demo.gif)

<sub>Left: `node --test` and `deno test` on the same file, including watch mode going red → green.<br>
Right: the same file in real Chrome, with QUnit's filterable, shareable UI.</sub>

</div>

---

Write a test once. Run it under Node's built-in runner, Deno's built-in runner, and a
real browser — the **same file**, unchanged, each runtime its usual way.

```ts
import { module, test } from 'qunitx';

module('Math', () => {
  test('addition', (assert) => {
    assert.equal(2 + 2, 4);
  });
});
```

```sh
node --test math-test.ts     # Node's runner
deno test math-test.ts       # Deno's runner
qunitx math-test.ts          # real browser, TAP in your terminal
```

No `jest.config.js`. No `vitest.config.ts`. No setup files, no transform pipeline, no
globals to inject. TypeScript runs as-is. **Zero runtime dependencies.**

---

## Why QUnit?

QUnit was created in 2008 by the jQuery team. Newer frameworks come and go; QUnit has
quietly accumulated 16+ years of real-world edge-case handling that younger tools are
still catching up to. Its assertion API is the most mature in the JavaScript ecosystem:

- **`assert.deepEqual`** handles circular references, prototype chains, Sets, Maps,
  typed arrays, Dates, RegExps and getters correctly — the cases that quietly return
  the wrong answer elsewhere.
- **`assert.throws` / `assert.rejects`** match errors by constructor, regex, error
  instance, or a custom validator.
- **`assert.step` / `verifySteps`** turn execution order into a declarative assertion,
  and catch missing async callbacks that other frameworks silently swallow.
- **`assert.expect(n)`** fails the test when exactly _n_ assertions did not run —
  invaluable for async code, where a missing assertion otherwise looks like a pass.
- **`assert.timeout(ms)`** is a hard per-test deadline, on all three runtimes.
- **Hooks** — `before`, `beforeEach`, `afterEach`, `after` with correct FIFO/LIFO
  ordering, properly scoped across nested modules.
- **Shareable browser URLs** — the QUnit UI keeps filter state in the query string, so
  `?moduleId=abc123` reproduces exactly what you were looking at for a colleague.

It is also fast. I've contributed [speed optimisations to QUnit itself](https://qunitjs.com/blog/2022/02/15/qunit-2-18-0/),
and we benchmark every part of this wrapper — in most cases the assertions beat Node's
and Deno's built-in ones. So I am not especially objective when I say QUnit(X) is the
best testing tool in JS/TS. But I have the benchmarks.

QUnitX wraps that API over **`node:test`** and **Deno's native runner**. No Jest, no
Vitest, no second framework underneath.

**Live example** — a real suite in the browser UI, filtered and linkable:
[objectmodel.js.org/test/?moduleId=6e15ed5f](https://objectmodel.js.org/test/?moduleId=6e15ed5f&moduleId=950ec9c5)

---

## Install

```sh
npm install --save-dev qunitx
```

Deno second — and under the same name:

```sh
deno add qunitx
```

That writes `qunitx` into your `deno.json` import map, so a test file copied between a
Node project and a Deno project keeps working. `qunitx` is the one specifier that
resolves on both runtimes; installing as `deno add jsr:@izelnakri/qunitx` instead writes
`@izelnakri/qunitx`, which Node cannot resolve. The
[JSR package](https://jsr.io/@izelnakri/qunitx) is the same library, published from CI
with provenance, and is worth importing directly only in Deno-only code.

Requires **Node.js >= 22** (LTS) or **Deno >= 2**. qunitx ships ESM only, so a Node
project created with `npm init -y` needs one line before its first `import` will load:

```sh
npm pkg set type=module
```

---

## Quick start

One file, every runtime:

```ts
// math-test.ts
import { module, test } from 'qunitx';

module('Math utilities', (hooks) => {
  let numbers: number[];

  hooks.beforeEach(() => {
    numbers = [1, 2, 3];
  });

  test('addition', (assert) => {
    assert.equal(numbers.reduce((sum, n) => sum + n, 0), 6);
  });

  test('deepEqual understands Sets and Maps', (assert) => {
    assert.deepEqual(
      { tags: new Set(['js']), scores: new Map([['a', 1]]) },
      { tags: new Set(['js']), scores: new Map([['a', 1]]) },
    );
  });

  module('Async', () => {
    test('resolves', async (assert) => {
      const user = await Promise.resolve({ id: 1, name: 'Alice' });
      assert.propContains(user, { name: 'Alice' });
    });
  });
});
```

Then run it with whichever runner you have. Nothing in the file changes between them.

### Node.js

```sh
node --test math-test.ts              # built-in runner, no extra deps
node --test --watch math-test.ts      # rerun on save
node --test --watch 'test/**/*.ts'    # globs
npx c8 node --test math-test.ts       # coverage
```

### Deno

```sh
deno test math-test.ts
deno test --allow-read --allow-env math-test.ts
deno test --coverage=cov math-test.ts
```

### Browser

[qunitx-cli](https://github.com/izelnakri/qunitx-cli) bundles your test file, runs it in
a real browser, and streams TAP back to your terminal:

```sh
npm install -g qunitx-cli

qunitx math-test.ts             # headless — TAP on stdout, CI-friendly
qunitx math-test.ts --debug     # opens the live QUnit UI too
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

## Assertions

Every assertion takes an optional trailing `message` used in the failure output. This is
the complete list.

### Truthiness

| | |
|---|---|
| `assert.ok(value)` | passes if `value` is truthy |
| `assert.notOk(value)` | passes if `value` is falsy |
| `assert.true(value)` | passes only for exactly `true` |
| `assert.false(value)` | passes only for exactly `false` |

### Equality

| | |
|---|---|
| `assert.equal(actual, expected)` | loose `==`, after QUnit's coercion rules |
| `assert.notEqual(actual, expected)` | loose `!=` |
| `assert.strictEqual(actual, expected)` | strict `===` — the one you usually want |
| `assert.notStrictEqual(actual, expected)` | strict `!==` |
| `assert.deepEqual(actual, expected)` | deep structural equality: nested objects, arrays, `Set`, `Map`, typed arrays, `Date`, `RegExp`, circular references |
| `assert.notDeepEqual(actual, expected)` | inverse of `deepEqual` |
| `assert.propEqual(actual, expected)` | compares **own enumerable properties only** — ignores prototype and class identity, so a class instance can equal a plain object |
| `assert.notPropEqual(actual, expected)` | inverse of `propEqual` |
| `assert.propContains(actual, expected)` | **partial** match: every property in `expected` must match, extras in `actual` are ignored |
| `assert.notPropContains(actual, expected)` | inverse of `propContains` |

`propContains` is the one to reach for when asserting on an API response you only partly
care about:

```js
test('api response', async (assert) => {
  const user = await fetchUser(1);
  // passes regardless of createdAt, updatedAt, avatarUrl, …
  assert.propContains(user, { id: 1, role: 'admin' });
});
```

### Errors

| | |
|---|---|
| `assert.throws(fn, expected?)` | `fn` must throw |
| `await assert.rejects(promise, expected?)` | `promise` must reject |

`expected` matches by constructor, by `RegExp` against the message, against another
`Error` instance (same constructor, name and message), or by a custom validator:

```js
test('error matching', (assert) => {
  assert.throws(() => JSON.parse('{'), SyntaxError);              // constructor
  assert.throws(() => parse(''), /unexpected end/i);              // message regex
  assert.throws(() => parse(''), new SyntaxError('unexpected'));  // Error instance
  assert.throws(() => run(), (err) => err.code === 'EAGAIN');     // validator
});

test('async errors', async (assert) => {
  await assert.rejects(fetchMissing(), TypeError);
});
```

> Passing an `async` function to `assert.throws` is a mistake that silently passes in
> most frameworks — it returns a rejected promise rather than throwing. QUnitX detects
> it and tells you to use `assert.rejects`.

### Execution order

| | |
|---|---|
| `assert.step(label)` | records a step |
| `assert.verifySteps(labels)` | asserts the recorded steps equal `labels` in order, then clears them |

```js
test('callbacks fire in order', (assert) => {
  emitter.on('start', () => assert.step('start'));
  emitter.on('done', () => assert.step('done'));

  emitter.run();

  assert.verifySteps(['start', 'done']);
});
```

### Async control

| | |
|---|---|
| `assert.expect(n)` | the test fails unless exactly `n` assertions ran |
| `assert.timeout(ms)` | hard deadline for this test; calling again resets it |
| `assert.async()` | returns a `done` callback; the test waits until every `done` is called |

```js
test('callback-style async', (assert) => {
  const done = assert.async();
  assert.expect(1);

  fs.readFile('data.json', (err, buf) => {
    assert.ok(buf.length > 0);
    done();
  });
});

test('deadline', async (assert) => {
  assert.timeout(500);
  assert.ok(await fetchSomething());
});
```

`assert.expect()` is what turns "the callback never fired" from a silent pass into a
failure. For `async`/`await` tests just use an `async` callback — `assert.async()` is for
callback APIs.

### Custom assertions

`assert.pushResult` is the building block every other assertion is made of. The plain
version is a function that takes `assert`:

```js
function assertIsEven(assert, value) {
  assert.pushResult({
    result: value % 2 === 0,
    actual: value,
    expected: 'an even number',
    message: `${value} is even`,
  });
}

test('even numbers', (assert) => {
  assertIsEven(assert, 4);
});
```

Better: put it **on `assert` itself**, so it reads like every built-in assertion and
needs no import at the call site. The assertion class is exported from `qunitx/assert`,
and adding to its prototype once — in a setup file, or at the top of your test helper —
makes it available in every test:

```js
// test-helpers.js
import Assert from 'qunitx/assert';

Assert.prototype.isEven = function (value, message) {
  this.pushResult({
    result: value % 2 === 0,
    actual: value,
    expected: 'an even number',
    message: message ?? `${value} is even`,
  });
};
```

```js
import './test-helpers.js';

test('even numbers', (assert) => {
  assert.isEven(4);                      // passes
  assert.isEven(3, 'three is even');     // fails, with your message
});
```

In TypeScript, declare the extended shape and assign through it:

```ts
import BaseAssert from 'qunitx/assert';

export interface Assert extends BaseAssert {
  isEven(value: number, message?: string): void;
}

(BaseAssert.prototype as Assert).isEven = function (value, message) {
  this.pushResult({
    result: value % 2 === 0,
    actual: value,
    expected: 'an even number',
    message: message ?? `${value} is even`,
  });
};
```

> `qunitx/assert` default-exports the class, so `declare module 'qunitx/assert'` cannot
> merge an interface into it — TypeScript can only augment *named* exports. Hence the
> explicit `extends` above. Test callbacks still receive the base type, so annotate the
> parameter (`(assert: Assert) => …`) where you call a custom assertion.

`qunitx/assert` touches no runner API, so it resolves the same way in Node, Deno and the
browser — a helper written against it is as portable as the tests that use it.

---

## Modules and hooks

`module()` groups tests and can nest. Hooks are declared on the `hooks` argument:

```js
module('Database', (hooks) => {
  hooks.before(async function () { this.db = await connect(); });     // once, first
  hooks.beforeEach(function () { this.tx = this.db.begin(); });       // before each test
  hooks.afterEach(function () { this.tx.rollback(); });               // after each test
  hooks.after(async function () { await this.db.close(); });          // once, last

  test('insert', function (assert) {
    assert.ok(this.tx.insert({ id: 1 }));
  });

  module('Nested', () => {
    // parent hooks still apply, outermost first
    test('inherits the transaction', function (assert) {
      assert.ok(this.tx);
    });
  });
});
```

`before` / `beforeEach` run FIFO (outermost first); `afterEach` / `after` run LIFO
(innermost first) — exactly as in QUnit.

### `describe` / `it` — BDD aliases

If you prefer BDD naming, `describe` and `it` are exported as aliases of `module` and
`test`. They are the *same function objects*, so everything that works on one works on
the other — options, `.skip`, `.todo`, nesting, and mixing the two styles in one file:

```js
import { describe, it } from 'qunitx';

describe('Math utilities', (hooks) => {
  hooks.beforeEach(function () {
    this.numbers = [1, 2, 3];
  });

  it('adds', (assert) => {
    assert.equal(2 + 2, 4);
  });

  it.skip('not yet implemented', (assert) => { /* never runs */ });
  it('flaky on CI', { skip: true }, (assert) => {});

  describe('Nested', () => {
    it('inherits parent hooks', function (assert) {
      assert.deepEqual(this.numbers, [1, 2, 3]);
    });
  });
});
```

### `context` — for arrow functions

QUnit exposes shared state as `this`, which arrow functions cannot see. QUnitX passes the
same object as `context` in the second argument of every hook and test, so both styles
work:

```js
// QUnit style — regular functions, `this`
module('Suite', function (hooks) {
  hooks.before(function () { this.db = createDb(); });
  test('query', function (assert) { assert.ok(this.db.query('SELECT 1')); });
});

// QUnitX style — arrow functions, `context`
module('Suite', (hooks, { context }) => {
  hooks.before((assert, { context }) => { context.db = createDb(); });
  test('query', (assert, { context }) => { assert.ok(context.db.query('SELECT 1')); });
});
```

Either way the state follows QUnit's prototype-chain model: each test gets a fresh object
inheriting from the module's, so `before()` writes are visible everywhere and a test's own
writes never leak into its siblings.

> **In TypeScript**, both bags are deliberately untyped, so `this.db` and `context.db` do
> not type-check under `deno test`'s built-in checker. For a typed `.ts` suite, declare
> the state as a variable in the `module()` closure and assign it from the hook — the
> pattern used in [Quick start](#quick-start) above.

---

## Skip and todo

```js
test.skip('not yet implemented', (assert) => { /* never runs */ });
test.todo('known broken', (assert) => { /* runs; failures do not fail the suite */ });
test.todo('not even started');                       // no body — registers as pending

test('flaky on CI', { skip: true }, (assert) => {}); // conditional, via options
test('waiting on API', { todo: 'needs endpoint' }, (assert) => {});

module.skip('Legacy API', () => { /* whole module skipped */ });
module.todo('Future features', () => { /* whole module pending */ });
```

`skip` and `todo` are also exported top-level for QUnit-style usage:

```js
import { module, test, skip, todo } from 'qunitx';
```

The BDD aliases carry the same helpers — `describe.skip`, `describe.todo`, `it.skip`,
and `it.todo` are the exact same functions.

> **Runtime difference:** Node's `todo` runs the body and ignores its failures. Deno has
> no todo concept and maps both `skip` and `todo` to "ignored" — the body does not run.

---

## Runtime options

The optional second argument to `module()` and `test()` is passed straight through to the
underlying runner, so anything `node:test` or Deno BDD accepts works:

```js
// Tests run sequentially by default, matching QUnit's browser behaviour.
module('Parallel suite', { concurrency: true }, () => { /* … */ });

// Deno-specific options
module('File access', { permissions: { read: true }, sanitizeExit: false }, () => {
  test('reads a file', async (assert) => {
    assert.ok((await Deno.readTextFile('./README.md')).length > 0);
  });
});
```

Options a runtime does not recognise are ignored, which is what keeps one file portable
across all three.

---

## Migrating from QUnit

One line:

```diff
- import { module, test } from 'qunit';
+ import { module, test } from 'qunitx';
```

Coming from a BDD runner instead? Import `describe` / `it` — they are aliases of
`module` / `test`, see [`describe` / `it`](#describe--it--bdd-aliases).

---

## QUnit compatibility

qunitx follows the same test-environment model as QUnit:

- **Fresh context per test** — each test gets its own `this` object. Writes in one test never bleed into a sibling.
- **Prototype-chain inheritance** — a parent module's `before()` hook sets properties on the module context. Each test inherits those properties, so reads work naturally (`this.x`) while writes stay local to the test.
- **`before()` assertions** — attributed to the first test in the module (matching QUnit's attribution model).
- **`after()` assertions** — attributed to the last test in the module.
- **Hook ordering** — `before`/`beforeEach` run FIFO; `afterEach`/`after` run LIFO, exactly as in QUnit.

> **Known difference:** In QUnit's browser runner, `before()` hook assertions are attributed to the first test in the *entire subtree* (including nested modules). In the Node/Deno adapters, they are attributed to the first *direct* test of the module. In the common case where direct tests appear before nested modules, the behavior is identical.

---

## How it works

| Runtime | Adapter |
|---|---|
| Node.js | wraps `node:test`'s `describe` / `it` with the QUnit lifecycle |
| Deno | wraps Deno's BDD helpers with the same lifecycle |
| Browser | a thin re-export of QUnit itself |

Because the browser path *is* QUnit, you get the whole thing there: plugins, custom
reporters, the event API (`QUnit.on`, `QUnit.done`, …) and the familiar UI, with no extra
layer in between.

QUnitX loads as an ordinary dependency instead of wrapping the runtime process, so v8
coverage instruments it with no special configuration:

```sh
npx c8 node --test test/                                    # Node
npx c8 --reporter=html node --test test/ && open coverage/index.html
deno test --coverage=cov test/ && deno coverage cov         # Deno
```

Browser coverage is the one gap — qunitx-cli bundles test files with esbuild, which
loses the mapping. Native import-map support in headless Chrome would remove the bundling
step and with it the limitation.

---

## Links

- [QUnit API reference](https://api.qunitjs.com) — every assertion, in depth
- [qunitx-cli](https://github.com/izelnakri/qunitx-cli) — the browser runner and all of its options
- [`@izelnakri/qunitx` on JSR](https://jsr.io/@izelnakri/qunitx) · [`qunitx` on npm](https://www.npmjs.com/package/qunitx)
- [Node.js test runner](https://nodejs.org/api/test.html) · [Deno testing](https://docs.deno.com/runtime/fundamentals/testing/)
