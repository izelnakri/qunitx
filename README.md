# QUnitX

***Truly universal testing for JavaScript with the oldest, most mature & flexible
testing API in the JavaScript ecosystem. Run the same test file in node.js, deno or in the browser***

Your test JS/TS file(s) can now run interchangably in different runtimes with
the default test runner of node.js or deno, or with a browser runner of your
choice!

In the browser you can use the same browser test/filter UI of
[QUnit](https://github.com/qunitjs/qunit) and share the web links with your
colleagues thanks to the test filters through query params feature of QUnit:

[QUnit Test Suite Example](https://objectmodel.js.org/test/?moduleId=6e15ed5f&moduleId=950ec9c5)

**UI visual automated tests also possible with QUnit!**

![QunitX terminal output](https://raw.githubusercontent.com/izelnakri/qunitx/main/docs/qunitx-help-stdout.png)

### Installation: Node & Deno

This is a 0-dependency test library that runs code in your target runtime(node,
deno or browser) test runner. Since a default test runner is a new feature of node.js, please use node.js v20.3+.

In order to use qunitx to convert qunit tests files please change:

```js
import { module, test } from 'qunit';

// to:
import { module, test } from 'qunitx';
```

Example:

```js
// in some-test.js: (typescript also works)
import { module, test } from 'qunitx';
import $ from 'jquery';

module('Basic sanity check', function (hooks) {
  test('it works', function (assert) {
    assert.equal(true, true);
  });

  module('More advanced cases', function (hooks) {
    test('deepEqual works', function (assert) {
      assert.deepEqual({ username: 'izelnakri' }, { username: 'izelnakri' });
    });
    test('can import ES & npm modules', function (assert) {
      assert.ok(Object.keys($));
    });
  });
});
```

```zsh
# you can run the test in node with ES modules package.json{ "type": "module" }
$ node --test some-test.js

# TypeScript also works, make sure on node.js mode, tsconfig.json exists with compilerOptions.module & compilerOptions.moduleResolution set to "NodeNext":
$ node --loader=ts-node/esm/transpile-only --test some-test.ts

# You can use the new watch mode of node.js to watch for files or folder patterns
$ node --test --watch some-test.js some-folder/*.js

# You can also run this test on deno. Unfortunately today deno requires one extra step to create a deno.json file:
$ echo '{"imports": { "qunitx": "https://esm.sh/qunitx/shims/deno/index.js" } }' > deno.json

# then run the tests in default deno test runner:
$ deno test some-test.js
```

### Installation: Browser

QUnitX mainly proxies to [QUnit
API](https://api.qunitjs.com/QUnit/module/#hooks-on-nested-modules) in browser.
You can use [QUnitX CLI](https://github.com/izelnakri/qunitx-cli) to get your
browser tests to stdout/CI or use the watch mode during the development.

```zsh
# Install QUnitX browser runner/cli:
$ npm install -g qunitx-cli
$ qunitx
$ qunitx some-test.js

# with browser output enabled:
$ qunitx some-test.js --debug

```

### Concurrency options

QUnitX API accepts an optional options object as 2nd argument to:
- `QUnit.module(testName, optionsOrHandler?, handler?)`
- `QUnit.test(testName, optionsOrHandler?, handler?)`

So you can run tests in parallel(default) or in series. You can even run them
through the [node.js test runner run()
api](https://nodejs.org/api/test.html#runoptions):

```js
// in some-test.js: (typescript also works)
import { module, test } from 'qunitx';
import $ from 'jquery';

module('Basic sanity check', function (hooks) {
  test('it works', { concurrency: false }, function (assert) {
    assert.equal(true, true);
  });

  module('More advanced cases', { concurrency: false, permissions: { read: true }, sanitizeExit: false }, function (hooks) {
    test('deepEqual works', function (assert) {
      assert.deepEqual({ username: 'izelnakri' }, { username: 'izelnakri' });
    });
    test('can import ES & npm modules', function (assert) {
      assert.ok(Object.keys($));
    });
  });
});
```

### Code coverage

Since QUnitX proxies to default node.js test runner in when executed with node,
you can use any code coverage tool you like. When running the tests in
`qunit`(the browser mode) code coverage support is limited.

```zsh
$ c8 node --test test/attachments test/user
```

You can browse [c8 documentation](https://github.com/bcoe/c8) for all
configuration options.

Implementing code coverage for the browser mode is currently not possible
because we use esbuild --bundle feature to create a JS bundles for testing in
the browser, this could be instrumented with `puppeteer-to-istanbul` however
instrumentation includes transpiled npm imports of `qunitx` and other potential
npm imports developer includes in the code, this cannot be filtered since
potential filtering can only occur after the `esbuild` bundling. When chrome
browser and puppeteer fully supports ES asset maps we can remove esbuild from
the browser mode, run everything in deno and make instrumentation for code
coverage possible with the default v8 instrumentation.

Esbuild plugin interface is an ongoing development, we might be able to figure
out a way to generate this instrumentation with esbuild in the future, which
could allow code coverage for --browser mode.
