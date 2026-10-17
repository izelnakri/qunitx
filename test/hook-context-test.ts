// @ts-nocheck
// Ported from QUnit 3.0.0's own test/main/modules.js, so the same file pins down the
// same hook semantics in the browser (QUnit itself), Node.js and Deno:
//
// - before() and after() run with their module's context, which inherits from the
//   parent module's context (QUnit 3, https://github.com/qunitjs/qunit/issues/1328).
// - Each test starts from a flat copy of its module's context, taken after the
//   before() hooks ran, so what one test writes never reaches another, or after().
// - Hooks run in order, waiting for assert.async() in each one before the next.
import { module, test } from 'qunitx';

module('hook context', function () {
  const hasOwn = Object.prototype.hasOwnProperty;
  // Every property of a context, own ones as `key=value`, inherited ones as `%key=value`.
  function flat(obj) {
    const str = [];
    for (const key in obj) {
      const prefix = !hasOwn.call(obj, key) ? '%' : '';
      str.push(prefix + key + '=' + obj[key]);
    }
    return str.join(' ') || '(empty)';
  }

  const actual = {};
  const expected = {
    'parent with children': [
      'parent-before: (empty)',
      'child-before: %beforeP=1',
      'parent-beforeEach: beforeC=1 beforeP=1',
      'child-beforeEach: beforeC=1 beforeP=1 beforeEach=P',
      'child-test: beforeC=1 beforeP=1 beforeEach=PC',
      'child-afterEach: beforeC=1 beforeP=1 beforeEach=PC tester=1',
      'parent-afterEach: beforeC=1 beforeP=1 beforeEach=PC tester=1 afterEach=C',
      'parent-beforeEach: beforeC=1 beforeP=1',
      'child-beforeEach: beforeC=1 beforeP=1 beforeEach=P',
      'child-test: beforeC=1 beforeP=1 beforeEach=PC',
      'child-afterEach: beforeC=1 beforeP=1 beforeEach=PC tester=2',
      'parent-afterEach: beforeC=1 beforeP=1 beforeEach=PC tester=2 afterEach=C',
      'child-after: beforeC=1 %beforeP=1',
      'parent-after: beforeP=1',
    ],
    'parent with trailing test': [
      'parent-before: (empty)',
      'child-before: %beforeP=1',
      'parent-beforeEach: beforeC=1 beforeP=1',
      'child-beforeEach: beforeC=1 beforeP=1 beforeEach=P',
      'child-test: beforeC=1 beforeP=1 beforeEach=PC',
      'child-afterEach: beforeC=1 beforeP=1 beforeEach=PC tester=1',
      'parent-afterEach: beforeC=1 beforeP=1 beforeEach=PC tester=1 afterEach=C',
      'child-after: beforeC=1 %beforeP=1',
      'parent-beforeEach: beforeP=1',
      'parent-test: beforeP=1 beforeEach=P',
      'parent-afterEach: beforeP=1 beforeEach=P tester=2',
      'parent-after: beforeP=1',
    ],
    'parent with initial test': [
      'parent-before: (empty)',
      'parent-beforeEach: beforeP=1',
      'parent-test: beforeP=1 beforeEach=P',
      'parent-afterEach: beforeP=1 beforeEach=P tester=1',
      'child-before: %beforeP=1',
      'parent-beforeEach: beforeC=1 beforeP=1',
      'child-beforeEach: beforeC=1 beforeP=1 beforeEach=P',
      'child-test: beforeC=1 beforeP=1 beforeEach=PC',
      'child-afterEach: beforeC=1 beforeP=1 beforeEach=PC tester=2',
      'parent-afterEach: beforeC=1 beforeP=1 beforeEach=PC tester=2 afterEach=C',
      'child-after: beforeC=1 %beforeP=1',
      'parent-after: beforeP=1',
    ],
    // Each hook waits for the assert.async() of the one before: identical to
    // 'parent with initial test'.
    'async hooks': [
      'parent-before: (empty)',
      'parent-beforeEach: beforeP=1',
      'parent-test: beforeP=1 beforeEach=P',
      'parent-afterEach: beforeP=1 beforeEach=P tester=1',
      'child-before: %beforeP=1',
      'parent-beforeEach: beforeC=1 beforeP=1',
      'child-beforeEach: beforeC=1 beforeP=1 beforeEach=P',
      'child-test: beforeC=1 beforeP=1 beforeEach=PC',
      'child-afterEach: beforeC=1 beforeP=1 beforeEach=PC tester=2',
      'parent-afterEach: beforeC=1 beforeP=1 beforeEach=PC tester=2 afterEach=C',
      'child-after: beforeC=1 %beforeP=1',
      'parent-after: beforeP=1',
    ],
    'multiple hooks': [
      'parent-before: (empty)',
      'parent-before: beforeP=1',
      'child-before: %beforeP=12',
      'child-before: beforeC=1 %beforeP=12',
      'parent-beforeEach: beforeC=12 beforeP=12',
      'parent-beforeEach: beforeC=12 beforeP=12 beforeEach=P1',
      'child-beforeEach: beforeC=12 beforeP=12 beforeEach=P1P2',
      'child-beforeEach: beforeC=12 beforeP=12 beforeEach=P1P2C1',
      'child-test: beforeC=12 beforeP=12 beforeEach=P1P2C1C2',
      'child-afterEach: beforeC=12 beforeP=12 beforeEach=P1P2C1C2 tester=2',
      'child-afterEach: beforeC=12 beforeP=12 beforeEach=P1P2C1C2 tester=2 afterEach=C2',
      'parent-afterEach: beforeC=12 beforeP=12 beforeEach=P1P2C1C2 tester=2 afterEach=C2C1',
      'parent-afterEach: beforeC=12 beforeP=12 beforeEach=P1P2C1C2 tester=2 afterEach=C2C1P2',
      'child-after: beforeC=12 %beforeP=12',
      'child-after: beforeC=12 afterC=2 %beforeP=12',
      'parent-after: beforeP=12',
      'parent-after: beforeP=12 afterP=2',
    ],
  };

  // The hooks every traced module registers, recording what each one sees in `x`.
  function traceHooks(hooks, x, side, suffix = '') {
    const tag = side === 'parent' ? 'P' : 'C';
    hooks.before(function () {
      x.push(`${side}-before: ` + flat(this));
      this[`before${tag}`] = (this[`before${tag}`] || '') + (suffix || '1');
    });
    hooks.beforeEach(function () {
      x.push(`${side}-beforeEach: ` + flat(this));
      this.beforeEach = (this.beforeEach || '') + tag + suffix;
    });
    hooks.afterEach(function () {
      x.push(`${side}-afterEach: ` + flat(this));
      this.afterEach = (this.afterEach || '') + tag + suffix;
    });
    hooks.after(function () {
      x.push(`${side}-after: ` + flat(this));
      this[`after${tag}`] = (this[`after${tag}`] || '') + (suffix || '1');
    });
  }

  function tracedTest(x, side, tester) {
    return function (assert) {
      x.push(`${side}-test: ` + flat(this));
      this.tester = tester;
      assert.true(true);
    };
  }

  module('parent with children', function (hooks) {
    const x = (actual['parent with children'] = []);
    traceHooks(hooks, x, 'parent');

    module('child', function (hooks) {
      traceHooks(hooks, x, 'child');
      test('one', tracedTest(x, 'child', '1'));
      test('two', tracedTest(x, 'child', '2'));
    });
  });

  module('parent with trailing test', function (hooks) {
    const x = (actual['parent with trailing test'] = []);
    traceHooks(hooks, x, 'parent');

    module('child', function (hooks) {
      traceHooks(hooks, x, 'child');
      test('one', tracedTest(x, 'child', '1'));
    });

    test('two', tracedTest(x, 'parent', '2'));
  });

  module('parent with initial test', function (hooks) {
    const x = (actual['parent with initial test'] = []);
    traceHooks(hooks, x, 'parent');

    test('one', tracedTest(x, 'parent', '1'));

    module('child', function (hooks) {
      traceHooks(hooks, x, 'child');
      test('two', tracedTest(x, 'child', '2'));
    });
  });

  module('async hooks', function (hooks) {
    const x = (actual['async hooks'] = []);
    // Records synchronously, then makes its change only after a timer, through assert.async().
    function later(assert, context, change) {
      const done = assert.async();
      setTimeout(() => {
        change(context);
        done();
      });
    }

    hooks.before(function (assert) {
      x.push('parent-before: ' + flat(this));
      later(assert, this, (c) => (c.beforeP = (c.beforeP || '') + '1'));
    });
    hooks.beforeEach(function (assert) {
      x.push('parent-beforeEach: ' + flat(this));
      later(assert, this, (c) => (c.beforeEach = (c.beforeEach || '') + 'P'));
    });
    hooks.afterEach(function (assert) {
      x.push('parent-afterEach: ' + flat(this));
      later(assert, this, (c) => (c.afterEach = (c.afterEach || '') + 'P'));
    });
    hooks.after(function (assert) {
      x.push('parent-after: ' + flat(this));
      later(assert, this, (c) => (c.afterP = (c.afterP || '') + '1'));
    });

    test('one', function (assert) {
      x.push('parent-test: ' + flat(this));
      later(assert, this, (c) => (c.tester = '1'));
      assert.true(true);
    });

    module('child', function (hooks) {
      hooks.before(function (assert) {
        x.push('child-before: ' + flat(this));
        later(assert, this, (c) => (c.beforeC = (c.beforeC || '') + '1'));
      });
      hooks.beforeEach(function (assert) {
        x.push('child-beforeEach: ' + flat(this));
        later(assert, this, (c) => (c.beforeEach = (c.beforeEach || '') + 'C'));
      });
      hooks.afterEach(function (assert) {
        x.push('child-afterEach: ' + flat(this));
        later(assert, this, (c) => (c.afterEach = (c.afterEach || '') + 'C'));
      });
      hooks.after(function (assert) {
        x.push('child-after: ' + flat(this));
        later(assert, this, (c) => (c.afterC = (c.afterC || '') + '1'));
      });

      test('two', function (assert) {
        x.push('child-test: ' + flat(this));
        assert.true(true);
        later(assert, this, (c) => (c.tester = '2'));
      });
    });
  });

  module('multiple hooks', function (hooks) {
    const x = (actual['multiple hooks'] = []);
    traceHooks(hooks, x, 'parent', '1');
    traceHooks(hooks, x, 'parent', '2');

    module('child', function (hooks) {
      traceHooks(hooks, x, 'child', '1');
      traceHooks(hooks, x, 'child', '2');
      test('two', tracedTest(x, 'child', '2'));
    });
  });

  // Declared after every traced module, so it runs once all of their hooks have.
  module('verify', function () {
    for (const key of Object.keys(expected)) {
      test(key, function (assert) {
        assert.deepEqual(actual[key], expected[key]);
      });
    }
  });

  module('module with initial skip', function (hooks) {
    const x = [];
    hooks.before(function () {
      x.push('before');
    });

    test.skip('one');

    test('two', function (assert) {
      assert.deepEqual(x, ['before'], 'hooks.before() runs on first unskipped test');
    });
  });

  module('module with trailing skip', function (hooks) {
    hooks.after(function (assert) {
      assert.true(true);
    });

    test('one', function (assert) {
      assert.expect(0);
      // hooks.after() does not run on first test
    });

    test('two', function (assert) {
      assert.expect(1);
      // hooks.after() runs on last unskipped test
    });

    test.skip('three');
  });

  module('module with only skips', function (hooks) {
    hooks.before(function (assert) {
      assert.true(false, 'should not occur');
    });
    hooks.after(function (assert) {
      assert.true(false, 'should not occur');
    });

    test.skip('one');
  });

  module('improper hook creation', function (hooks) {
    module('child', function (innerHooks) {
      let outerHookRan = false;
      let innerHookRan = false;
      let beforeEachErrorMessage = null;

      try {
        hooks.beforeEach(function () {
          outerHookRan = true;
        });
      } catch (e) {
        beforeEachErrorMessage = e.message;
      }

      innerHooks.beforeEach(function () {
        innerHookRan = true;
      });

      test('create hook on parent module', function (assert) {
        assert.strictEqual(
          beforeEachErrorMessage,
          'Cannot add beforeEach hook outside the containing module. Called on "hook context > improper hook creation", instead of expected "hook context > improper hook creation > child". https://qunitjs.com/api/QUnit/module/#E0002',
          'beforeEachErrorMessage',
        );
        assert.false(outerHookRan, 'outerHookRan');
        assert.true(innerHookRan, 'innerHookRan');
      });
    });

    test('create hook during test', function (assert) {
      assert.throws(function () {
        hooks.beforeEach(function () {});
      }, /Cannot add beforeEach hook outside the containing module/);
    });
  });

  module('disallow async module callback', function () {
    let caught;
    try {
      module('with async callback', async function () {});
    } catch (e) {
      caught = e;
    }

    test('async callback function errored', function (assert) {
      assert.true(caught instanceof TypeError);
      assert.strictEqual(
        caught.message,
        'QUnit.module() callback must not be async. For async module setup, use hooks. https://qunitjs.com/api/QUnit/module/#hooks',
      );
    });
  });
});
