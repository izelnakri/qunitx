import { module, test } from 'qunitx';

module('Assertion: Property Equality - passing assertions', function () {
  test('propEqual', function (assert) {
    function Foo (x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    Foo.prototype.doA = function () {};
    Foo.prototype.bar = 'non-function';

    function Bar () {
    }
    Bar.prototype = Object.create(Foo.prototype);
    Bar.prototype.constructor = Bar;

    assert.propEqual(
      new Foo(1, '2', []),
      {
        x: 1,
        y: '2',
        z: []
      }
    );

    assert.notPropEqual(
      new Foo('1', 2, 3),
      {
        x: 1,
        y: '2',
        z: 3
      },
      'Primitive values are strictly compared'
    );

    assert.notPropEqual(
      new Foo(1, '2', []),
      {
        x: 1,
        y: '2',
        z: {}
      },
      'Array type is preserved'
    );

    assert.notPropEqual(
      new Foo(1, '2', {}),
      {
        x: 1,
        y: '2',
        z: []
      },
      'Empty array is not the same as empty object'
    );

    assert.propEqual(
      new Foo(1, '2', new Foo([3], new Bar(), null)),
      {
        x: 1,
        y: '2',
        z: {
          x: [3],
          y: {},
          z: null
        }
      },
      'Complex nesting of different types, inheritance and constructors'
    );
  });

  test('propContains', function (assert) {
    function Foo (x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    Foo.prototype.doA = function () {};
    Foo.prototype.bar = 'non-function';

    function Bar (x) {
      this.x = x;
    }
    Bar.prototype = Object.create(Foo.prototype);
    Bar.prototype.constructor = Bar;

    assert.propContains(
      { a: 0, b: 'something', c: true },
      { a: 0, b: 'something', c: true }
    );
    assert.propContains(
      { a: 0, b: 'something', c: true },
      { a: 0, c: true },
      'match object subset'
    );
    assert.propContains(
      ['a', 'b'],
      { 1: 'b' },
      'match array subset via plain object'
    );
    assert.propContains(
      [],
      {},
      'empty array contains empty object'
    );
    assert.propContains(
      {},
      [],
      'empty object contains empty array'
    );
    assert.propContains(
      new Foo(1, '2', []),
      new Foo(1, '2', []),
      'deeply equal class instances'
    );
    assert.propContains(
      new Foo(1, '2', []),
      {
        x: 1,
        y: '2',
        z: []
      },
      'match different constructor via plain object'
    );
    assert.propContains(
      new Foo(1, '2', []),
      {
        x: 1
      },
      'match different constructor subset via plain object'
    );
    assert.propContains(
      new Foo(1, '2', ['x']),
      new Foo(1, '2', { 0: 'x' }),
      'match nested array via plain object'
    );
    assert.propContains(
      new Foo(1, ['a', 'b'], new Foo(['c', 'd'], new Bar(), null)),
      {
        x: 1,
        y: ['a', 'b'],
        z: {
          x: { 1: 'd' }
        }
      },
      'match nested array subset via plain object'
    );
    assert.propContains(
      new Foo(1, '2'),
      new Bar(1),
      'match subset via different constructor'
    );
  });

  test('notPropContains', function (assert) {
    function Foo (x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    Foo.prototype.doA = function () {};
    Foo.prototype.bar = 'non-function';

    function Bar (x) {
      this.x = x;
    }
    Bar.prototype = Object.create(Foo.prototype);
    Bar.prototype.constructor = Bar;

    assert.notPropContains(
      { a: 0, b: 'something', c: true },
      { a: 0, b: 'different', c: true }
    );
    assert.notPropContains(
      { a: 0, b: 'something', c: true },
      { a: 0, c: false }
    );
    assert.notPropContains(
      { a: 0, b: 'something', c: true },
      { e: 'missing' }
    );
    assert.notPropContains(
      new Foo(1, '2', []),
      {
        x: 1,
        y: '2',
        z: [],
        e: 'missing'
      },
      'matching and missing properties'
    );
    assert.notPropContains(
      new Foo(1, '2', []),
      {
        e: 'missing'
      },
      'missing property'
    );
    assert.notPropContains(
      new Foo(1, [], new Foo([], new Bar(), 'something')),
      new Foo(1, [], new Foo([], new Bar(), 'different')),
      'difference in nested value'
    );
    assert.notPropContains(
      new Foo(1, '2', new Foo([3], new Bar(), null)),
      {
        x: 1,
        y: '2',
        z: {
          e: 'missing'
        }
      },
      'nested object with missing property'
    );
    assert.notPropContains(
      new Foo(1, '2'),
      new Bar(2),
      'different property value via different constructor'
    );
  });
});

// module('Assertion: Property Equality - failing assertions', function () {
//   test('propEqual', function (assert) {
//     function Foo (x, y, z) {
//       this.x = x;
//       this.y = y;
//       this.z = z;
//     }
//     Foo.prototype.baz = function () {};
//     Foo.prototype.bar = 'prototype';

//     assert.propEqual(
//       new Foo('1', 2, 3),
//       {
//         x: 1,
//         y: '2',
//         z: 3
//       }
//     );
//   });

//   test('notPropEqual', function (assert) {
//     function Foo (x, y, z) {
//       this.x = x;
//       this.y = y;
//       this.z = z;
//     }
//     Foo.prototype.baz = function () {};
//     Foo.prototype.bar = 'prototype';

//     assert.notPropEqual(
//       new Foo(1, '2', []),
//       {
//         x: 1,
//         y: '2',
//         z: []
//       }
//     );
//   });
// });
