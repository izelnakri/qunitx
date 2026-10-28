// Type-only fixture, checked by `npm run test:types` against the declarations npm ships.
// An assertion plugin types its methods on the global `Assert` interface, as qunit-dom
// does; they must reach the `assert` of every qunitx entry with no shim in between.
import { assert, module, test } from 'qunitx';
import * as browser from '../../dist/browser/index.js';

declare global {
  interface Assert {
    isTheAnswer(value: number, message?: string): void;
  }
}

assert.isTheAnswer = function (value, message) {
  this.pushResult({ result: value === 42, actual: value, expected: 42, message });
};

module('node and deno', () => {
  test('plugin assertions are typed', (assert) => {
    assert.isTheAnswer(42);
    assert.strictEqual(1, 1);
    // @ts-expect-error: not an assertion
    assert.isTheQuestion();
  });
});

browser.assert.isTheAnswer(42);
// `Assert` names a value and a type in the browser entry too, as in the others.
const browserAssert: browser.Assert = browser.Assert.prototype;
browserAssert.isTheAnswer(42);
browser.module('browser', (hooks) => {
  hooks.beforeEach((assert) => assert.isTheAnswer(42));
  browser.test('plugin assertions are typed', (assert) => {
    assert.isTheAnswer(42);
    // @ts-expect-error: not an assertion
    assert.isTheQuestion();
  });
});
