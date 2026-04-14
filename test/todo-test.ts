import { module, test, todo } from 'qunitx';

module('todo', function () {
  // test.todo with a failing assertion — must not fail the suite
  test.todo('test.todo does not fail the suite on failing assertion', function (assert) {
    assert.ok(false, 'not yet implemented');
  });

  // top-level todo() alias
  todo('todo() is an alias for test.todo', function (assert) {
    assert.ok(false, 'not yet implemented');
  });

  // test.todo with no callback — registers as todo without a body
  test.todo('test.todo with no callback');

  // A regular test after todo entries to verify execution continues
  test('normal test after todo entries still runs', function (assert) {
    assert.ok(true);
  });

  // todo via runtimeOptions: { todo: true }
  test('test todo via runtimeOptions { todo: true }', { todo: true }, function (assert) {
    assert.ok(false, 'runtimeOptions todo:true body should not count as suite failure');
  });

  // todo via runtimeOptions: { todo: 'reason string' }
  test(
    'test todo via runtimeOptions { todo: string }',
    { todo: 'not yet implemented' },
    function (assert) {
      assert.ok(false, 'runtimeOptions todo:string body should not count as suite failure');
    },
  );
});
