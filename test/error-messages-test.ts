// @ts-nocheck
import { module, test } from 'qunitx';

// These tests verify that assertion failure messages are human- and LLM-friendly:
// clear Actual/Expected labels, unified diffs for structural comparisons, and
// descriptive throws/rejects messages — not cryptic auto-generated ones.
//
// Browser (QUnit) is excluded because failures are recorded, not thrown, so
// error message shapes differ.
if (typeof (globalThis as Record<string, unknown>)['document'] === 'undefined') {
  module('Error messages: equal / notEqual / strictEqual / notStrictEqual', () => {
    test('equal failure shows Actual/Expected labels with inspect values', (assert) => {
      let msg = '';
      try {
        assert.equal('hello', 'world');
      } catch (e) {
        msg = (e as Error).message;
      }
      assert.ok(msg.includes('Actual:'), `has "Actual:" label — got:\n${msg}`);
      assert.ok(msg.includes('Expected:'), `has "Expected:" label — got:\n${msg}`);
      assert.ok(
        msg.includes("'hello'") || msg.includes('"hello"'),
        `shows actual value — got:\n${msg}`,
      );
      assert.ok(
        msg.includes("'world'") || msg.includes('"world"'),
        `shows expected value — got:\n${msg}`,
      );
      assert.ok(!msg.includes('should equal to:'), `no old verbose label — got:\n${msg}`);
    });

    test('notEqual failure describes the matching value', (assert) => {
      let msg = '';
      try {
        assert.notEqual(5, 5);
      } catch (e) {
        msg = (e as Error).message;
      }
      assert.ok(msg.includes('5'), `message references the value — got:\n${msg}`);
      assert.ok(!msg.includes('should notEqual to:'), `no old verbose label — got:\n${msg}`);
    });

    test('strictEqual failure shows Actual/Expected labels with inspect values', (assert) => {
      let msg = '';
      try {
        assert.strictEqual(42, 99);
      } catch (e) {
        msg = (e as Error).message;
      }
      assert.ok(msg.includes('Actual:'), `has "Actual:" label — got:\n${msg}`);
      assert.ok(msg.includes('Expected:'), `has "Expected:" label — got:\n${msg}`);
      assert.ok(msg.includes('42'), `shows actual value — got:\n${msg}`);
      assert.ok(msg.includes('99'), `shows expected value — got:\n${msg}`);
      assert.ok(!msg.includes('is strictEqual to:'), `no old verbose label — got:\n${msg}`);
    });

    test('notStrictEqual failure describes the matching value', (assert) => {
      let msg = '';
      try {
        assert.notStrictEqual('x', 'x');
      } catch (e) {
        msg = (e as Error).message;
      }
      assert.ok(msg.includes('x'), `message references the value — got:\n${msg}`);
      assert.ok(!msg.includes('is notStrictEqual to:'), `no old verbose label — got:\n${msg}`);
    });

    test('equal failure on type mismatch shows both values clearly', (assert) => {
      let msg = '';
      try {
        assert.strictEqual(42 as unknown as string, '42');
      } catch (e) {
        msg = (e as Error).message;
      }
      assert.ok(msg.includes('42'), `shows the number — got:\n${msg}`);
      assert.ok(msg.includes("'42'") || msg.includes('"42"'), `shows the string — got:\n${msg}`);
    });
  });

  module('Error messages: deepEqual / notDeepEqual unified diff', () => {
    test('deepEqual failure on objects shows unified diff with - and + markers', (assert) => {
      let msg = '';
      try {
        assert.deepEqual({ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 });
      } catch (e) {
        msg = (e as Error).message;
      }
      assert.ok(
        msg.includes('-') && msg.includes('+'),
        `diff markers present — got:\n${msg.slice(0, 400)}`,
      );
      assert.ok(
        msg.includes('Alice') || msg.includes('Bob'),
        `diff contains changed values — got:\n${msg.slice(0, 400)}`,
      );
      assert.ok(
        !msg.includes('should deepEqual to:'),
        `no old verbose label — got:\n${msg.slice(0, 200)}`,
      );
    });

    test('deepEqual failure on nested objects shows changed nested keys', (assert) => {
      let msg = '';
      try {
        assert.deepEqual(
          { name: 'Alice', address: { city: 'NYC', zip: '10001' } },
          { name: 'Alice', address: { city: 'LA', zip: '90001' } },
        );
      } catch (e) {
        msg = (e as Error).message;
      }
      assert.ok(
        msg.includes('NYC') || msg.includes('LA'),
        `shows changed nested value — got:\n${msg.slice(0, 400)}`,
      );
      assert.ok(
        msg.includes('-') && msg.includes('+'),
        `diff markers present — got:\n${msg.slice(0, 400)}`,
      );
    });

    test('deepEqual failure on arrays shows changed elements', (assert) => {
      let msg = '';
      try {
        assert.deepEqual([1, 2, 3, 4, 5], [1, 2, 99, 4, 5]);
      } catch (e) {
        msg = (e as Error).message;
      }
      assert.ok(
        msg.includes('3') && msg.includes('99'),
        `shows both old and new values — got:\n${msg.slice(0, 400)}`,
      );
      assert.ok(
        msg.includes('-') && msg.includes('+'),
        `diff markers present — got:\n${msg.slice(0, 400)}`,
      );
    });

    test('notDeepEqual failure shows the matching value', (assert) => {
      let msg = '';
      try {
        assert.notDeepEqual({ a: 1 }, { a: 1 });
      } catch (e) {
        msg = (e as Error).message;
      }
      assert.ok(msg.includes('1'), `message contains the value — got:\n${msg}`);
      assert.ok(!msg.includes('should notDeepEqual to:'), `no old verbose label — got:\n${msg}`);
    });
  });

  module('Error messages: propEqual / propContains', () => {
    test('propEqual failure shows unified diff', (assert) => {
      let msg = '';
      try {
        assert.propEqual({ a: 1, b: 2 }, { a: 1, b: 99 });
      } catch (e) {
        msg = (e as Error).message;
      }
      assert.ok(
        msg.includes('2') || msg.includes('99'),
        `shows differing values — got:\n${msg.slice(0, 400)}`,
      );
      assert.ok(!msg.includes('should propEqual to:'), `no old verbose label — got:\n${msg}`);
    });

    test('notPropEqual failure shows the matching value', (assert) => {
      let msg = '';
      try {
        assert.notPropEqual({ a: 1 }, { a: 1 });
      } catch (e) {
        msg = (e as Error).message;
      }
      assert.ok(msg.includes('1'), `message contains the value — got:\n${msg}`);
      assert.ok(!msg.includes('should notPropEqual to:'), `no old verbose label — got:\n${msg}`);
    });

    test('propContains failure shows what was expected vs actual', (assert) => {
      let msg = '';
      try {
        assert.propContains({ a: 1, b: 2 }, { a: 99 });
      } catch (e) {
        msg = (e as Error).message;
      }
      assert.ok(
        msg.includes('1') || msg.includes('99'),
        `shows differing values — got:\n${msg.slice(0, 400)}`,
      );
      assert.ok(!msg.includes('should propContains to:'), `no old verbose label — got:\n${msg}`);
    });

    test('notPropContains failure shows the matching value', (assert) => {
      let msg = '';
      try {
        assert.notPropContains({ a: 1 }, { a: 1 });
      } catch (e) {
        msg = (e as Error).message;
      }
      assert.ok(msg.includes('1'), `message contains the value — got:\n${msg}`);
      assert.ok(!msg.includes('should notPropContains of:'), `no old verbose label — got:\n${msg}`);
    });
  });

  module('Error messages: throws / rejects', () => {
    test('throws regex mismatch shows pattern and received error — not "false undefined"', (assert) => {
      let msg = '';
      try {
        assert.throws(() => {
          throw new Error('actual message');
        }, /expected pattern/);
      } catch (e) {
        msg = (e as Error).message;
      }
      assert.ok(
        msg.length > 0 && msg !== 'Assertion failed',
        `message is not generic — got:\n${msg}`,
      );
      assert.ok(!msg.startsWith('false'), `no cryptic "false undefined ..." — got:\n${msg}`);
      assert.ok(
        msg.includes('expected pattern') || msg.includes('/expected pattern/'),
        `shows the pattern — got:\n${msg}`,
      );
      assert.ok(msg.includes('actual message'), `shows the received error text — got:\n${msg}`);
    });

    test('throws constructor mismatch names the expected constructor', (assert) => {
      let msg = '';
      try {
        assert.throws(() => {
          throw new TypeError('type error');
        }, RangeError);
      } catch (e) {
        msg = (e as Error).message;
      }
      assert.ok(
        msg.length > 0 && msg !== 'Assertion failed',
        `message is not generic — got:\n${msg}`,
      );
      assert.ok(
        msg.includes('RangeError') || msg.includes('TypeError'),
        `names the constructors — got:\n${msg}`,
      );
    });

    test('rejects regex mismatch shows pattern and received error', async (assert) => {
      let msg = '';
      try {
        await assert.rejects(Promise.reject(new Error('actual rejection')), /expected pattern/);
      } catch (e) {
        msg = (e as Error).message;
      }
      assert.ok(
        msg.length > 0 && msg !== 'Assertion failed',
        `message is not generic — got:\n${msg}`,
      );
      assert.ok(!msg.startsWith('false'), `no cryptic "false undefined ..." — got:\n${msg}`);
      assert.ok(
        msg.includes('expected pattern') || msg.includes('/expected pattern/'),
        `shows the pattern — got:\n${msg}`,
      );
      assert.ok(msg.includes('actual rejection'), `shows the received error text — got:\n${msg}`);
    });

    test('rejects constructor mismatch names the expected constructor', async (assert) => {
      let msg = '';
      try {
        await assert.rejects(Promise.reject(new TypeError('type error')), RangeError);
      } catch (e) {
        msg = (e as Error).message;
      }
      assert.ok(
        msg.length > 0 && msg !== 'Assertion failed',
        `message is not generic — got:\n${msg}`,
      );
      assert.ok(
        msg.includes('RangeError') || msg.includes('TypeError'),
        `names the constructors — got:\n${msg}`,
      );
    });
  });

  module('Stack traces: internal Assert frames are hidden', () => {
    function firstFrame(e: unknown): string {
      return (
        ((e as Error).stack ?? '').split('\n').find((l) => l.trimStart().startsWith('at ')) ?? ''
      );
    }

    test('equal: first stack frame is user code', (assert) => {
      let frame = '';
      try {
        assert.equal('a', 'b');
      } catch (e) {
        frame = firstFrame(e);
      }
      assert.ok(frame, 'stack has at least one frame');
      assert.ok(!frame.includes('Assert.') && !frame.includes('/assert.ts'), `got: ${frame}`);
    });

    test('strictEqual: first stack frame is user code', (assert) => {
      let frame = '';
      try {
        assert.strictEqual(1, 2);
      } catch (e) {
        frame = firstFrame(e);
      }
      assert.ok(frame, 'stack has at least one frame');
      assert.ok(!frame.includes('Assert.') && !frame.includes('/assert.ts'), `got: ${frame}`);
    });

    test('deepEqual: first stack frame is user code', (assert) => {
      let frame = '';
      try {
        assert.deepEqual({ a: 1 }, { a: 2 });
      } catch (e) {
        frame = firstFrame(e);
      }
      assert.ok(frame, 'stack has at least one frame');
      assert.ok(!frame.includes('Assert.') && !frame.includes('/assert.ts'), `got: ${frame}`);
    });

    test('throws mismatch: first stack frame is user code', (assert) => {
      let frame = '';
      try {
        assert.throws(() => {
          throw new Error('x');
        }, /nope/);
      } catch (e) {
        frame = firstFrame(e);
      }
      assert.ok(frame, 'stack has at least one frame');
      assert.ok(!frame.includes('Assert.') && !frame.includes('/assert.ts'), `got: ${frame}`);
    });

    test('pushResult: first stack frame is user code', (assert) => {
      let frame = '';
      try {
        assert.pushResult({ result: false, message: 'fail' });
      } catch (e) {
        frame = firstFrame(e);
      }
      assert.ok(frame, 'stack has at least one frame');
      assert.ok(!frame.includes('Assert.') && !frame.includes('/assert.ts'), `got: ${frame}`);
    });
  });
}
