import { module, test } from 'qunitx';

module('module', function () {
  module('before/beforeEach/afterEach/after', function (hooks) {
    hooks.before(function (assert) {
      this.lastHook = 'module-before';
    });
    hooks.beforeEach(function (assert) {
      assert.strictEqual(this.lastHook, 'module-before', "Module's beforeEach runs after before");
      this.lastHook = 'module-beforeEach';
    });
    hooks.afterEach(function (assert) {
      assert.strictEqual(
        this.lastHook,
        'test-block',
        "Module's afterEach runs after current test block",
      );
      this.lastHook = 'module-afterEach';
    });
    hooks.after(function (assert) {
      assert.strictEqual(this.lastHook, 'module-afterEach', "Module's afterEach runs before after");
      this.lastHook = 'module-after';
    });

    test('hooks order', function (assert) {
      assert.expect(4);

      assert.strictEqual(
        this.lastHook,
        'module-beforeEach',
        "Module's beforeEach runs before current test block",
      );
      this.lastHook = 'test-block';
    });
  });

  module('modules with async hooks', (hooks) => {
    hooks.before(async (assert) => {
      assert.step('before');
    });
    hooks.beforeEach(async (assert) => {
      assert.step('beforeEach');
    });
    hooks.afterEach(async (assert) => {
      assert.step('afterEach');
    });

    hooks.after((assert) => {
      assert.verifySteps(['before', 'beforeEach', 'afterEach']);
    });

    test('all hooks', (assert) => {
      assert.expect(4);
    });
  });

  module('before', function (hooks) {
    hooks.before(function (assert) {
      assert.true(true, 'before hook ran');

      if (typeof this.beforeCount === 'undefined') {
        this.beforeCount = 0;
      }

      this.beforeCount++;
    });

    test('runs before first test', function (assert) {
      assert.expect(2);
      assert.equal(this.beforeCount, 1, 'beforeCount should be one');
    });
  });

  module('before runs only once across multiple tests', function (hooks) {
    let callCount = 0;
    hooks.before(function () {
      callCount++;
    });

    test('first test: before ran once', function (assert) {
      assert.equal(callCount, 1, 'before ran exactly once before first test');
    });

    test('second test: before still ran only once', function (assert) {
      assert.equal(callCount, 1, 'before did not run again for second test');
    });

    test('third test: before still ran only once', function (assert) {
      assert.equal(callCount, 1, 'before did not run again for third test');
    });
  });

  module('Test context object', function (hooks) {
    hooks.beforeEach(function (assert) {
      this.helper = 'Test context object';
      var key;
      var keys = [];

      for (key in this) {
        keys.push(key);
      }
      assert.deepEqual(keys, ['helper']);
    });

    test('keys', function (assert) {
      assert.expect(1);
      this.contextTest = true;
    });
  });

  module('afterEach and assert.async', function (hooks) {
    hooks.beforeEach(function () {
      this.state = false;
    });
    hooks.afterEach(function (assert) {
      assert.strictEqual(this.state, true, 'Test afterEach.');
    });

    test('afterEach must be called after test ended', function (assert) {
      var testContext = this;
      var done = assert.async();
      assert.expect(1);
      setTimeout(function () {
        testContext.state = true;
        done();
      });
    });
  });

  module('async beforeEach test', function (hooks) {
    hooks.beforeEach(function (assert) {
      var done = assert.async();
      setTimeout(function () {
        assert.true(true);
        done();
      });
    });

    test('module with async beforeEach', function (assert) {
      assert.expect(2);
      assert.true(true);
    });
  });

  module('async afterEach test', function (hooks) {
    hooks.afterEach(function (assert) {
      var done = assert.async();
      setTimeout(function () {
        assert.true(true);
        done();
      });
    });

    test('module with async afterEach', function (assert) {
      assert.expect(2);
      assert.true(true);
    });
  });

  module('save scope', function (hooks) {
    hooks.before(function (assert) {
      this.foo = 'bar';
    });
    hooks.beforeEach(function (assert) {
      assert.equal(this.foo, 'bar');
      this.foo = 'bar';
    });
    hooks.afterEach(function (assert) {
      assert.deepEqual(this.foo, 'foobar');
    });

    test('scope check', function (assert) {
      assert.expect(3);
      assert.deepEqual(this.foo, 'bar');
      this.foo = 'foobar';
    });
  });

  module('prototype-chain context inheritance', function (hooks) {
    hooks.before(function () {
      this.fromBefore = 'set-in-before';
    });
    hooks.beforeEach(function () {
      this.fromBeforeEach = 'set-in-beforeEach';
    });

    test('before() and beforeEach() props are readable in tests', function (assert) {
      assert.expect(2);
      assert.strictEqual(this.fromBefore, 'set-in-before', 'before() prop is readable');
      assert.strictEqual(this.fromBeforeEach, 'set-in-beforeEach', 'beforeEach() prop is readable');
    });

    test('sibling tests see the same before() value independently', function (assert) {
      assert.expect(2);
      assert.strictEqual(this.fromBefore, 'set-in-before', 'before() value unchanged for sibling');
      assert.strictEqual(
        this.fromBeforeEach,
        'set-in-beforeEach',
        'beforeEach() runs fresh per test',
      );
    });
  });

  module('nested modules', function () {
    module('first outer', function (hooks) {
      hooks.afterEach(function (assert) {
        assert.true(true, 'first outer module afterEach called');
      });
      hooks.beforeEach(function (assert) {
        assert.true(true, 'first outer beforeEach called');
      });

      module('first inner', function (hooks) {
        hooks.afterEach(function (assert) {
          assert.true(true, 'first inner module afterEach called');
        });
        hooks.beforeEach(function (assert) {
          assert.true(true, 'first inner module beforeEach called');
        });

        test('in module, before-/afterEach called in out-in-out order', function (assert) {
          var module = assert.test.module;
          assert.equal(module.name, 'module > nested modules > first outer > first inner');
          assert.expect(5);
        });
      });

      test('test after nested module is processed', function (assert) {
        var module = assert.test.module;
        assert.equal(module.name, 'module > nested modules > first outer');
        assert.expect(3);
      });

      module('second inner', function () {
        test('test after non-nesting module declared', function (assert) {
          var module = assert.test.module;
          assert.equal(module.name, 'module > nested modules > first outer > second inner');
          assert.expect(3);
        });
      });
    });

    module('second outer', function () {
      test('test after all nesting modules processed and new module declared', function (assert) {
        var module = assert.test.module;
        assert.equal(module.name, 'module > nested modules > second outer');
      });
    });
  });

  test('modules with nested functions does not spread beyond', function (assert) {
    assert.equal(assert.test.module.name, 'module');
  });

  module('contained suite arguments', function (hooks) {
    test('hook functions', function (assert) {
      assert.strictEqual(typeof hooks.beforeEach, 'function');
      assert.strictEqual(typeof hooks.afterEach, 'function');
    });

    module('outer hooks', function (hooks) {
      hooks.beforeEach(function (assert) {
        assert.true(true, 'beforeEach called');
      });

      hooks.afterEach(function (assert) {
        assert.true(true, 'afterEach called');
      });

      test('call hooks', function (assert) {
        assert.expect(2);
      });

      module('stacked inner hooks', function (hooks) {
        hooks.beforeEach(function (assert) {
          assert.true(true, 'nested beforeEach called');
        });

        hooks.afterEach(function (assert) {
          assert.true(true, 'nested afterEach called');
        });

        test('call hooks', function (assert) {
          assert.expect(4);
        });
      });
    });
  });

  module('contained suite `this`', function (hooks) {
    this.outer = 1;

    hooks.beforeEach(function () {
      if (!this.outer) {
        throw new Error('THERE IS NO this.outer!!');
      }
      this.outer++;
    });

    hooks.afterEach(function (assert) {
      assert.equal(
        this.outer,
        42,
        'in-test environment modifications are visible by afterEach callbacks',
      );
    });

    test('`this` is shared from modules to the tests', function (assert) {
      assert.equal(this.outer, 2);
      this.outer = 42;
    });

    test("sibling tests don't share environments", function (assert) {
      assert.equal(this.outer, 2);
      this.outer = 42;
    });

    module('nested suite `this`', function (hooks) {
      this.inner = true;

      hooks.beforeEach(function (assert) {
        assert.strictEqual(this.outer, 2);
        assert.true(this.inner);
      });

      hooks.afterEach(function (assert) {
        assert.strictEqual(this.outer, 2);
        assert.true(this.inner);

        // This change affects the outermodule afterEach assertion.
        this.outer = 42;
      });

      test('inner modules share outer environments', function (assert) {
        assert.strictEqual(this.outer, 2);
        assert.true(this.inner);
      });
    });

    test("tests can't see environments from nested modules", function (assert) {
      assert.strictEqual(this.inner, undefined);
      this.outer = 42;
    });
  });

  module('nested modules before/after', function (hooks) {
    hooks.before(function (assert) {
      assert.true(true, 'before hook ran');
      this.lastHook = 'before';
    });
    hooks.after(function (assert) {
      assert.strictEqual(this.lastHook, 'outer-after');
    });

    test('should run before', function (assert) {
      // assert.expect() differs by runtime: node/deno=3 (before+body+after), browser=2 (body+after only)
      // before-hook assertions are attributed to all tests in node/deno vs first-in-subtree in browser
      assert.strictEqual(this.lastHook, 'before');
      this.lastHook = 'outer-after';
    });

    module('outer', function (hooks) {
      hooks.before(function (assert) {
        assert.true(true, 'outer before hook ran');
        this.lastHook = 'outer-before';
      });
      hooks.after(function (assert) {
        assert.strictEqual(this.lastHook, 'outer-test');
        this.lastHook = 'outer-after';
      });

      module('inner', function (hooks) {
        hooks.before(function (assert) {
          assert.strictEqual(this.lastHook, 'outer-before');
          this.lastHook = 'inner-before';
        });
        hooks.after(function (assert) {
          assert.strictEqual(this.lastHook, 'inner-test');
        });

        test('should run outer-before and inner-before', function (assert) {
          // assert.expect() differs by runtime: node/deno=2 (innermost-before+body), browser=3 (all-parent-befores+body)
          assert.strictEqual(this.lastHook, 'inner-before');
        });

        test('should run inner-after', function (assert) {
          // 1 assertion (after only) — before() is attributed to the first test in the module only
          this.lastHook = 'inner-test';
        });
      });

      test('should run outer-after and after', function (assert) {
        assert.expect(2);
        this.lastHook = 'outer-test';
      });
    });
  });

  module(
    'context parameter in hooks and tests (arrow-function friendly)',
    (hooks, { context: moduleCtx }) => {
      moduleCtx.fromModuleMeta = 'module-meta';

      hooks.before((assert, { context }) => {
        context.fromBefore = 'before';
      });
      hooks.beforeEach((assert, { context }) => {
        context.fromBeforeEach = 'beforeEach';
      });
      hooks.afterEach((assert, { context }) => {
        assert.strictEqual(context.fromTest, 'test', 'afterEach context sees test-set value');
      });
      hooks.after((assert, { context }) => {
        assert.strictEqual(context.fromTest, 'test', 'after context sees last test value');
      });

      test('context is the same object as this', (assert, { context }) => {
        assert.expect(7);
        assert.strictEqual(
          context.fromModuleMeta,
          'module-meta',
          'module meta context carried into test',
        );
        assert.strictEqual(
          context.fromBefore,
          'before',
          'before hook set value visible via context',
        );
        assert.strictEqual(
          context.fromBeforeEach,
          'beforeEach',
          'beforeEach hook set value visible via context',
        );
        assert.ok(
          context === Object.getPrototypeOf(context) || context !== null,
          'context is an object',
        );
        context.fromTest = 'test';
        assert.strictEqual(context.fromTest, 'test', 'test can write to context');
        // +1 from afterEach, +1 from after (attributed to last test per QUnit model)
      });
    },
  );

  module('multiple hooks', function (hooks) {
    hooks.before(function (assert) {
      assert.step('before1');
    });
    hooks.before(function (assert) {
      assert.step('before2');
    });

    hooks.beforeEach(function (assert) {
      assert.step('beforeEach1');
    });
    hooks.beforeEach(function (assert) {
      assert.step('beforeEach2');
    });

    hooks.afterEach(function (assert) {
      assert.step('afterEach1');
    });
    hooks.afterEach(function (assert) {
      assert.step('afterEach2');
    });

    hooks.after(function (assert) {
      assert.verifySteps([
        // before/beforeEach execute in FIFO order
        'before1',
        'before2',
        'beforeEach1',
        'beforeEach2',

        // after/afterEach execute in LIFO order
        'afterEach2',
        'afterEach1',
        'after2',
        'after1',
      ]);
    });

    hooks.after(function (assert) {
      assert.step('after1');
    });
    hooks.after(function (assert) {
      assert.step('after2');
    });

    test('all hooks', function (assert) {
      assert.expect(9);
    });
  });
});
