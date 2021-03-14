# QUnitx

Experimental improvements, suggestions for qunit CLI

![Qunitx terminal output](https://raw.githubusercontent.com/izelnakri/qunitx/main/docs/qunitx-help-stdout.png)

Default test output is TAP(Test-Anything-Protocol_) thus you can use any tap reporter of your choice to display test
output in anyway you like. Example:

```
# using it with tap-difflet TAP reporter:
qunitx tests/attachments tests/user | npx tap-difflet
```

#### Installation:

```sh
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
// some-test.js:
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

```
$ qunitx some-test.js

# or if you want to run it in browser:

$ qunitx some-test.js --browser

# with browser output enabled:

$ qunitx some-test.js --browser --debug
```
