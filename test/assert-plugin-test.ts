import { Assert, assert as assertPrototype, module, test } from 'qunitx';

// An assertion plugin, installed the way qunit-dom's setup(assert) installs one: on the
// exported `assert`, which every test's assert inherits from on every runtime.
// test/types/assert-plugin.ts checks that its global `Assert` typing reaches qunitx's Assert.
type PluginAssert = { isTheAnswer(value: number, message?: string): void };

(assertPrototype as unknown as PluginAssert).isTheAnswer = function (
  this: typeof assertPrototype,
  value,
  message,
) {
  this.pushResult({
    result: value === 42,
    actual: value,
    expected: 42,
    message: message ?? 'is the answer',
  });
};

module('Assertion plugins', function () {
  test('a method installed on the exported assert is on every test assert', function (assert) {
    assert.strictEqual(typeof (assert as unknown as PluginAssert).isTheAnswer, 'function');
    (assert as unknown as PluginAssert).isTheAnswer(6 * 7);
  });

  test('the exported assert is the prototype of the test assert', function (assert) {
    assert.strictEqual(Object.getPrototypeOf(assert), assertPrototype);
  });

  test('the exported assert is the prototype of the exported Assert class', function (assert) {
    assert.strictEqual(Assert.prototype, assertPrototype);
    assert.true(assert instanceof Assert);
  });
});
