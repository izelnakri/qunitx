import { module, test } from 'qunitx';

module('module', function () {
  module('before/beforeEach/afterEach/after', function(hooks) {
    hooks.before(function (assert) {
      this.lastHook = 'module-before';
    });
    hooks.beforeEach(function (assert) {
      assert.strictEqual(this.lastHook, 'module-before',
        "Module's beforeEach runs after before");
      this.lastHook = 'module-beforeEach';
    });
    hooks.afterEach(function (assert) {
      assert.strictEqual(this.lastHook, 'test-block',
        "Module's afterEach runs after current test block");
      this.lastHook = 'module-afterEach';
    });
    hooks.after(function (assert) {
      assert.strictEqual(this.lastHook, 'module-afterEach',
        "Module's afterEach runs before after");
      this.lastHook = 'module-after';
    });

    test('hooks order', function (assert) {
      assert.expect(4);

      assert.strictEqual(this.lastHook, 'module-beforeEach',
        "Module's beforeEach runs before current test block");
      this.lastHook = 'test-block';
    });
  });

  module('modules with async hooks', hooks => {
    hooks.before(async assert => { assert.step('before'); });
    hooks.beforeEach(async assert => { assert.step('beforeEach'); });
    hooks.afterEach(async assert => { assert.step('afterEach'); });

    hooks.after(assert => {
      assert.verifySteps([
        'before',
        'beforeEach',
        'afterEach'
      ]);
    });

    test('all hooks', assert => {
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
    hooks.beforeEach(function() {
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
    hooks.before(function(assert) {
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
          assert.equal(module.name,
            'module > nested modules > first outer > first inner');
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
        this.outer, 42,
        'in-test environment modifications are visible by afterEach callbacks'
      );
    });

    test('`this` is shared from modules to the tests', function (assert) {
      assert.equal(this.outer, 2); // NOTE: this should be 2 but it gets 4
      this.outer = 42;
    });

    test("sibling tests don't share environments", function (assert) {
      assert.equal(this.outer, 2); // NOTE: this should be 2 but it gets 4
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
      // assert.expect(3);
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
          // assert.expect(4); // THIS HAS TO BE 2 or 4
          assert.strictEqual(this.lastHook, 'inner-before');
        });

        test('should run inner-after', function (assert) {
          // assert.expect(2); // THIS HAS TO BE 2 or 3, not 1 like QUnit
          this.lastHook = 'inner-test';
        });
      });

      test('should run outer-after and after', function (assert) {
        assert.expect(2);
        this.lastHook = 'outer-test';
      });
    });
  });

  module('multiple hooks', function (hooks) {
    hooks.before(function (assert) { assert.step('before1'); });
    hooks.before(function (assert) { assert.step('before2'); });

    hooks.beforeEach(function (assert) { assert.step('beforeEach1'); });
    hooks.beforeEach(function (assert) { assert.step('beforeEach2'); });

    hooks.afterEach(function (assert) { assert.step('afterEach1'); });
    hooks.afterEach(function (assert) { assert.step('afterEach2'); });

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
        'after1'
      ]);
    });

    hooks.after(function (assert) { assert.step('after1'); });
    hooks.after(function (assert) { assert.step('after2'); });

    test('all hooks', function (assert) {
      assert.expect(9);
    });
  });
});
