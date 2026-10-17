// @ts-nocheck
// Run as a subprocess by test/only-test.ts. Ported from QUnit 3.0.0's own
// test/cli/fixtures/only-module.js: every test that must not run fails if it does.
import { module, test } from 'qunitx';

module('module A', function () {
  test('test A', function (assert) {
    assert.true(false, 'this test should not run');
  });
});

module('module B', function () {
  module('This module should not run', function () {
    test('normal test', function (assert) {
      assert.true(false, 'this test should not run');
    });
  });

  module.only('Only this module should run', function () {
    test.todo('a todo test', function (assert) {
      assert.true(false, 'not implemented yet');
    });

    test.skip('implicitly skipped test', function (assert) {
      assert.true(false, 'test should be skipped');
    });

    test('normal test', function (assert) {
      assert.true(true, 'this test should run');
    });
  });

  module('This also should not run', function () {
    test('normal test', function (assert) {
      assert.true(false, 'this test should not run');
    });
  });
});

module('module C', function (hooks) {
  // Nothing in this module runs, so neither do its hooks.
  hooks.before(function (assert) {
    assert.true(false, 'this hook should not run');
  });

  test('test C', function (assert) {
    assert.true(false, 'this test should not run');
  });
});

module.only('module D', function () {
  test('test D', function (assert) {
    assert.true(true, 'this test should run as well');
  });
});

module('module D1', function () {
  module('module D2', function () {
    test('test D3', function (assert) {
      assert.true(false, 'this test should not run');
    });
  });
});

module.only('module E', function () {
  module('module F', function () {
    test('test F', function (assert) {
      assert.true(true, 'this test should run as well');
    });
  });

  test('test E', function (assert) {
    assert.true(true, 'this test should run as well');
  });
});

module.skip('module G', function () {
  module.only('module H', function () {
    test('test H', function (assert) {
      assert.true(false, 'this test should not run');
    });
  });
});

module.todo('module I', function () {
  test('test I', function (assert) {
    assert.true(false, 'this test should not run');
  });
});

module('module J', function () {
  test('test J1', function (assert) {
    assert.true(false, 'this test should not run');
  });

  test.only('test J2', function (assert) {
    assert.true(true, 'an only test in a module that is not');
  });

  test.only.each('test J3', [1, 2], function (assert, n) {
    assert.true(n > 0, 'each case of an only.each runs');
  });
});
