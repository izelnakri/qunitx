import { module, test, skip } from 'qunitx';

module('skip', function () {
  // test.skip: body must never execute — if it does, the suite fails
  test.skip('test.skip does not execute its body', function (assert) {
    assert.ok(false, 'test.skip body should never run');
  });

  // skip (top-level alias for test.skip, matching QUnit's export)
  skip('skip() is an alias for test.skip', function (assert) {
    assert.ok(false, 'skip() body should never run');
  });

  // module.skip: all tests inside must be skipped
  module.skip('module.skip skips all tests inside', function () {
    test('skipped module inner test', function (assert) {
      assert.ok(false, 'test inside module.skip should never run');
    });
  });

  // A regular test after static skip entries — proves execution continues
  test('normal test after skip entries still runs', function (assert) {
    assert.ok(true);
  });

  // skip via runtimeOptions: { skip: true }
  test('test skipped via runtimeOptions { skip: true }', { skip: true }, function (assert) {
    assert.ok(false, 'runtimeOptions skip:true body should never run');
  });

  // skip via runtimeOptions: { skip: 'reason string' }
  test(
    'test skipped via runtimeOptions { skip: string }',
    { skip: 'not yet implemented' },
    function (assert) {
      assert.ok(false, 'runtimeOptions skip:string body should never run');
    },
  );

  // module skip via runtimeOptions: { skip: true }
  module('module skipped via runtimeOptions { skip: true }', { skip: true }, function () {
    test('inner test should not run', function (assert) {
      assert.ok(false, 'test inside skip:true module should never run');
    });
  });

  // module skip via runtimeOptions: { skip: true } combined with other options
  module(
    'module skipped via runtimeOptions { concurrency: true, skip: string }',
    { concurrency: true, skip: 'not yet implemented' },
    function () {
      test('inner test should not run', function (assert) {
        assert.ok(false, 'test inside skip:string module should never run');
      });
    },
  );
});

// Regression: a skipped module must not capture the siblings declared after it.
// QUnit's processModule() sets config.currentModule unconditionally but restores it
// only when given a callback, so calling module.skip/.todo without one reparented
// every later sibling under the skipped module and reported it as skipped.
// Browser-only — Node and Deno always scoped these correctly.
// A swallowed sibling is reported as *skipped*, never failed, so asserting inside each
// sibling would silently pass if the bug returned — as would an after() hook on the
// module below, since QUnit does not run hooks for skipped tests. The count is checked
// from a separate top-level module instead: processModule() restores the scope when the
// enclosing callback exits, so the leak cannot reach past the module that caused it.
let siblingsRan = 0;

module('skipped modules do not swallow later siblings', function () {
  module.skip('skipped via module.skip', function () {
    test('inner test should not run', function (assert) {
      assert.ok(false, 'test inside module.skip should never run');
    });
  });

  test('sibling after module.skip runs', function (assert) {
    siblingsRan++;
    assert.ok(true);
  });

  module.todo('pending via module.todo', function () {
    test('inner test should not run', function (assert) {
      assert.ok(false, 'test inside module.todo should never run');
    });
  });

  test('sibling after module.todo runs', function (assert) {
    siblingsRan++;
    assert.ok(true);
  });

  module('skipped via runtimeOptions { skip: true }', { skip: true }, function () {
    test('inner test should not run', function (assert) {
      assert.ok(false, 'test inside skip:true module should never run');
    });
  });

  test('sibling after module({ skip: true }) runs', function (assert) {
    siblingsRan++;
    assert.ok(true);
  });
});

module('skipped module scope guard', function () {
  test('all three siblings after a skipped module ran', function (assert) {
    assert.strictEqual(siblingsRan, 3, 'no sibling was captured by a skipped module');
  });
});
