import { module, test } from 'qunitx';

let RESULT = [];

function debug(message, assert) {
  // console.log(message);
  RESULT.push(message);

  assert.true(true, `${message} called`);
}

module('contained suite arguments', function (hooks) {
  hooks.before(function (assert) {
    debug('module.before', assert);
  });
  hooks.beforeEach(function (assert) {
    debug('module.beforeEach', assert);
  });
  hooks.afterEach(function (assert) {
    debug('module.afterEach', assert);
  });
  hooks.after(function (assert) {
    debug('module.after', assert);

    assert.deepEqual(RESULT.length, [
      'module.before',
      'module.beforeEach',
      'module.test',
      'module.afterEach',
      'outer.before',
      'inner.before',
      'module.beforeEach',
      'outer.beforeEach',
      'inner.beforeEach',
      'inner.test',
      'inner.afterEach',
      'outer.afterEach',
      'module.afterEach',
      'inner.after',
      'module.beforeEach',
      'outer.beforeEach',
      'outer.test',
      'outer.afterEach',
      'module.afterEach',
      '2nd inner.before',
      'module.beforeEach',
      'outer.beforeEach',
      '2nd inner.beforeEach',
      '2nd inner.test',
      '2nd inner.afterEach',
      'outer.afterEach',
      'module.afterEach',
      '2nd inner.after',
      'outer.after',
      'module.after',
    ].length);
  });

  test('module.test', function (assert) {
    debug('module.test', assert);
  });

  module('outer module', function (hooks) {
    hooks.before(function (assert) {
      debug('outer.before', assert);
    });
    hooks.beforeEach(function (assert) {
      debug('outer.beforeEach', assert);
    });
    hooks.afterEach(function (assert) {
      debug('outer.afterEach', assert);
    });
    hooks.after(function (assert) {
      debug('outer.after', assert);
    });

    module('inner module', function (hooks) {
      hooks.before(function (assert) {
        debug('inner.before', assert);
      });
      hooks.beforeEach(function (assert) {
        debug('inner.beforeEach', assert);
      });
      hooks.afterEach(function (assert) {
        debug('inner.afterEach', assert);
      });
      hooks.after(function (assert) {
        debug('inner.after', assert);
      });

      test('inner.test', function (assert) {
        debug('inner.test', assert);
        // assert.expect(4);
      });
    });

    test('outer.test', function (assert) {
      debug('outer.test', assert);
    });

    module('2nd inner module', function (hooks) {
      hooks.before(function (assert) {
        debug('2nd inner.before', assert);
      });
      hooks.beforeEach(function (assert) {
        debug('2nd inner.beforeEach', assert);
      });
      hooks.afterEach(function (assert) {
        debug('2nd inner.afterEach', assert);
      });
      hooks.after(function (assert) {
        debug('2nd inner.after', assert);
      });

      test('2nd inner.test', function (assert) {
        debug('2nd inner.test', assert);
        // assert.expect(4);
      });
    });
  });
});

// Target order(order can be different but all hooks should be called):
// - module.before
// - module.beforeEach
// - module.test
// - module.afterEach
// - outer.before
// - inner.before
// - module.beforeEach
// - outer.beforeEach
// - inner.beforeEach
// - inner.test
// - inner.afterEach
// - outer.afterEach
// - module.afterEach
// - inner.after
// - module.beforeEach
// - outer.beforeEach
// - outer.test
// - outer.afterEach
// - module.afterEach
// - 2nd inner.before
// - module.beforeEach
// - outer.beforeEach
// - 2nd inner.beforeEach
// - 2nd inner.test
// - 2nd inner.afterEach
// - outer.afterEach
// - module.afterEach
// - 2nd inner.after
// - outer.after
// - module.after

// Current wrong order:
// Things dont get called: outer.beforeEach, outer.test, outer.afterEach, inner.beforeEach, inner.afterEach, inner.test, outer.afterEach,
// module.afterEach(3x) module.beforeEach(3x), outer.beforeEach(2x), outer.afterEach(2x)
// [
//   'module.before',
//   'outer.before',
//   'module.beforeEach',
//   'inner.before',
//   '2nd inner.before',
//   'module.test',
//   'module.afterEach',
//   'inner.after',
//   '2nd inner.after',
//   'outer.after',
//   'module.after'
// ]
