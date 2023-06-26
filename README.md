# QUnitX

Experimental improvements, suggestions for qunit CLI

![QunitX terminal output](https://raw.githubusercontent.com/izelnakri/qunitx/main/docs/qunitx-help-stdout.png)

Default test output is TAP (_Test-Anything-Protocol_) thus you can use any tap reporter of your choice to display test
output in anyway you like. Example:

```zsh
# using it with tap-difflet TAP reporter:
qunitx tests/attachments tests/user | npx tap-difflet
```

#### Installation:

```zsh
npm install -g qunitx

qunitx
```

In order to use qunitx to execute existing qunit tests please change:

```js
import { module, test } from 'qunit';

// to:
import { module, test } from 'qunitx';
```

Example:

```js
// in some-test.js: (typescript is also supported for --browser mode and node.js with --loader flag)
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

# Suggested mode: if you want to run it in CI/google chrome:

$ qunitx some-test.js --browser

# with browser output enabled:

$ qunitx some-test.js --browser --debug

# TypeScript also works, make sure on node.js mode, tsconfig.json exists with compilerOptions.module & compilerOptions.moduleResolution set to "NodeNext":

$ node --loader=ts-node/esm/transpile-only --test some-test.ts

$ qunitx some-test.ts --browser --debug

```

### Code coverage

QUnitX runner on node.js mode(without --browser) supports code coverage with c8, the best coverage tool
in existence at the moment:

```
c8 qunitx test/attachments test/user
```

You can browse [c8 documentation](https://github.com/bcoe/c8) for all configuration options.

Implementing code coverage for the browser mode is currently not possible because we use esbuild --bundle feature to
create a JS bundles for testing in the browser, this could be instrumented with `puppeteer-to-istanbul` however
instrumentation includes transpiled npm imports of `qunitx` and other potential npm imports developer
includes in the code, this cannot be filtered since potential filtering can only occur after the `esbuild` bundling.
When chrome browser and puppeteer fully supports ES asset maps we can remove esbuild from the browser mode, run
everything in deno and make instrumentation for code coverage possible with the default v8 instrumentation.

Esbuild plugin interface is an ongoing development, we might be able to figure out a way to generate this instrumentation
with esbuild in the future, which could allow code coverage for --browser mode.
