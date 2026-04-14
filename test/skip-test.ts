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
