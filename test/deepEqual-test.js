// NOTE: primitive class extensions are not correct
// NOTE: consequetive arguments(2+) on deepEqual behavior removed, not a good feature and creates problems on interop
import { module, test } from 'qunitx';

module('deepEqual', function () {
  test('Primitive types and constants', function (assert) {
    assert.deepEqual(null, null, 'null');
    assert.notDeepEqual(null, {}, 'null');
    assert.notDeepEqual(null, undefined, 'null');
    assert.notDeepEqual(null, 0, 'null');
    assert.notDeepEqual(null, false, 'null');
    assert.notDeepEqual(null, '', 'null');
    assert.notDeepEqual(null, [], 'null');

    assert.deepEqual(undefined, undefined, 'undefined');
    assert.notDeepEqual(undefined, null, 'undefined');
    assert.notDeepEqual(undefined, 0, 'undefined');
    assert.notDeepEqual(undefined, false, 'undefined');
    assert.notDeepEqual(undefined, {}, 'undefined');
    assert.notDeepEqual(undefined, [], 'undefined');
    assert.notDeepEqual(undefined, '', 'undefined');

    assert.deepEqual(0 / 0, 0 / 0, 'NaN'); // NaN VS NaN
    assert.deepEqual(1 / 0, 2 / 0, 'Infinity'); // Infinity VS Infinity
    assert.notDeepEqual(-1 / 0, 2 / 0, '-Infinity, Infinity'); // -Infinity VS Infinity
    assert.deepEqual(-1 / 0, -2 / 0, '-Infinity, -Infinity'); // -Infinity VS -Infinity
    assert.notDeepEqual(0 / 0, 1 / 0, 'NaN, Infinity'); // NaN VS Infinity
    assert.notDeepEqual(1 / 0, 0 / 0, 'NaN, Infinity'); // NaN VS Infinity
    assert.notDeepEqual(0 / 0, null, 'NaN');
    assert.notDeepEqual(0 / 0, undefined, 'NaN');
    assert.notDeepEqual(0 / 0, 0, 'NaN');
    assert.notDeepEqual(0 / 0, false, 'NaN');
    assert.notDeepEqual(0 / 0, function () {}, 'NaN');
    assert.notDeepEqual(1 / 0, null, 'NaN, Infinity');
    assert.notDeepEqual(1 / 0, undefined, 'NaN, Infinity');
    assert.notDeepEqual(1 / 0, 0, 'NaN, Infinity');
    assert.notDeepEqual(1 / 0, 1, 'NaN, Infinity');
    assert.notDeepEqual(1 / 0, false, 'NaN, Infinity');
    assert.notDeepEqual(1 / 0, true, 'NaN, Infinity');
    assert.notDeepEqual(1 / 0, function () {}, 'NaN, Infinity');

    assert.deepEqual(0, 0, 'number');
    assert.notDeepEqual(0, 1, 'number');
    assert.notDeepEqual(1, 0, 'number');
    assert.deepEqual(1, 1, 'number');
    assert.deepEqual(1.1, 1.1, 'number');
    assert.deepEqual(0.0000005, 0.0000005, 'number');
    assert.notDeepEqual(0, '', 'number');
    assert.notDeepEqual(0, '0', 'number');
    assert.notDeepEqual(1, '1', 'number');
    assert.notDeepEqual(0, false, 'number');
    assert.notDeepEqual(1, true, 'number');

    assert.deepEqual(true, true, 'boolean');
    assert.notDeepEqual(true, false, 'boolean');
    assert.notDeepEqual(false, true, 'boolean');
    assert.notDeepEqual(false, 0, 'boolean');
    assert.notDeepEqual(false, null, 'boolean');
    assert.notDeepEqual(false, undefined, 'boolean');
    assert.notDeepEqual(true, 1, 'boolean');
    assert.notDeepEqual(true, null, 'boolean');
    assert.notDeepEqual(true, undefined, 'boolean');

    assert.deepEqual('', '', 'string');
    assert.deepEqual('a', 'a', 'string');
    assert.deepEqual('foobar', 'foobar', 'string');
    assert.notDeepEqual('foobar', 'foo', 'string');
    assert.notDeepEqual('', 0, 'string');
    assert.notDeepEqual('', false, 'string');
    assert.notDeepEqual('', null, 'string');
    assert.notDeepEqual('', undefined, 'string');

    var SafeNumber = Number;
    var SafeString = String;
    var SafeBoolean = Boolean;
    var SafeObject = Object;

    // assert.deepEqual(0, new SafeNumber(), 'number 0 primitive vs. object');
    // assert.deepEqual(new SafeNumber(), 0, 'number 0 object vs. primitive');
    assert.deepEqual(new SafeNumber(), new SafeNumber(), 'empty number objects');
    // assert.deepEqual(1, new SafeNumber(1), 'number 1 primitive vs. object');
    // assert.deepEqual(new SafeNumber(1), 1, 'number 1 object vs. primitive');
    assert.deepEqual(new SafeNumber(1), new SafeNumber(1), 'number 1 objects');
    assert.notDeepEqual(0, new SafeNumber(1), 'differing number primitive vs. object');
    assert.notDeepEqual(new SafeNumber(0), 1, 'differing number object vs. primitive');

    // assert.deepEqual('', new SafeString(), 'empty string primitive vs. object');
    // assert.deepEqual(new SafeString(), '', 'empty string object vs. primitive');
    assert.deepEqual(new SafeString(), new SafeString(), 'empty string objects');
    // assert.deepEqual('My String', new SafeString('My String'), 'nonempty string primitive vs. object');
    // assert.deepEqual(new SafeString('My String'), 'My String', 'nonempty string object vs. primitive');
    assert.deepEqual(
      new SafeString('My String'),
      new SafeString('My String'),
      'nonempty string objects',
    );
    assert.notDeepEqual(
      'Bad String',
      new SafeString('My String'),
      'differing string primitive vs. object',
    );
    assert.notDeepEqual(
      new SafeString('Bad String'),
      'My String',
      'differing string object vs. primitive',
    );

    // assert.deepEqual(false, new SafeBoolean(), 'boolean false primitive vs. object');
    // assert.deepEqual(new SafeBoolean(), false, 'boolean empty object vs. primitive');
    assert.deepEqual(new SafeBoolean(), new SafeBoolean(), 'empty boolean objects');
    // assert.deepEqual(true, new SafeBoolean(true), 'boolean true primitive vs. object');
    // assert.deepEqual(new SafeBoolean(true), true, 'boolean true object vs. primitive');
    assert.deepEqual(new SafeBoolean(true), new SafeBoolean(true), 'boolean true objects');
    // assert.deepEqual(true, new SafeBoolean(1), 'boolean true primitive vs. truthy object');
    // assert.deepEqual(false, new SafeBoolean(false), 'boolean false primitive vs. false object');
    // assert.deepEqual(new SafeBoolean(false), false, 'boolean false object vs. primitive');
    assert.deepEqual(new SafeBoolean(false), new SafeBoolean(false), 'boolean false objects');
    // assert.deepEqual(false, new SafeBoolean(0), 'boolean false primitive vs. falsy object');
    // assert.notDeepEqual(true, new SafeBoolean(false), 'boolean differing primitive vs. object');
    // assert.notDeepEqual(new SafeBoolean(true), false, 'boolean differing object vs. primitive');

    assert.deepEqual(new SafeObject(), new SafeObject(), 'empty object primitive vs. object');
    assert.notDeepEqual({ a: 1 }, new SafeObject(), 'non-empty object primitive vs. object');
    assert.deepEqual({ a: 1 }, new SafeObject({ a: 1 }), 'non-empty object primitive vs. object');
    assert.notDeepEqual(new SafeObject(), { a: 1 }, 'empty object object vs. primitive');
    assert.deepEqual(new SafeObject({ a: 1 }), { a: 1 }, 'non-empty object object vs. primitive');
    assert.deepEqual(
      new SafeObject({ a: 1 }),
      new SafeObject({ a: 1 }),
      'non-empty object objects',
    );

    assert.deepEqual([], [], 'empty array');
    assert.notDeepEqual([], [1], 'empty array');
    assert.deepEqual([1], [1], 'single-element array');
    assert.deepEqual([1, 2], [1, 2], 'multi-element array');
    assert.notDeepEqual([1, 2], [2, 1], 'differing array');
    assert.notDeepEqual([1, 2], [1, 2, 3], 'differing array');
    assert.notDeepEqual([1, 2, 3], [1, 2], 'differing array');

    assert.deepEqual([null], [null], 'single-element array with null');
    assert.deepEqual([undefined], [undefined], 'single-element array with undefined');
    assert.deepEqual([NaN], [NaN], 'single-element array with NaN');
    assert.deepEqual([Infinity], [Infinity], 'single-element array with Infinity');
    assert.deepEqual([-Infinity], [-Infinity], 'single-element array with -Infinity');
    assert.deepEqual([{}], [{}], 'single-element array with empty object');
    assert.deepEqual([[]], [[]], 'single-element array with empty array');
    // assert.deepEqual([function () {}], [function () {}], 'single-element array with function');
  });

  test('Objects basics', function (assert) {
    assert.deepEqual({}, {}, true);
    assert.notDeepEqual({}, null, false);
    assert.notDeepEqual({}, undefined, false);
    assert.notDeepEqual({}, 0, false);
    assert.notDeepEqual({}, false, false);

    // This test is a hard one, it is very important
    // REASONS:
    // 1) They are of the same type "object"
    // 2) [] instanceof Object is true
    // 3) Their properties are the same (doesn't exists)
    assert.notDeepEqual({}, [], false);

    assert.deepEqual({ a: 1 }, { a: 1 }, true);
    assert.notDeepEqual({ a: 1 }, { a: '1' }, false);
    assert.deepEqual({ a: [] }, { a: [] }, true);
    assert.notDeepEqual({ a: {} }, { a: null }, false);
    assert.notDeepEqual({ a: 1 }, {}, false);
    assert.notDeepEqual({}, { a: 1 }, false);

    // Hard ones
    assert.notDeepEqual({ a: undefined }, {}, false);
    assert.notDeepEqual({}, { a: undefined }, false);
    assert.notDeepEqual(
      {
        a: [{ bar: undefined }],
      },
      {
        a: [{ bat: undefined }],
      },
      false,
    );
  });

  // test('Objects with null prototypes', function (assert) {
  //   var nonEmptyWithNoProto;

  //   assert.deepEqual(
  //     assert.deepEqual(Object.create(null), {}),
  //     true,
  //     'empty object without prototype VS empty object'
  //   );

  //   assert.deepEqual(
  //     {}, Object.create(null),
  //     'empty object VS empty object without prototype'
  //   );

  //   nonEmptyWithNoProto = Object.create(null);
  //   nonEmptyWithNoProto.foo = 'bar';

  //   assert.deepEqual(
  //     nonEmptyWithNoProto, { foo: 'bar' },
  //     'object without prototype VS object'
  //   );

  //   assert.deepEqual(
  //     { foo: 'bar' }, nonEmptyWithNoProto,
  //     'object VS object without prototype'
  //   );
  // });

  test('Object prototype constructor is null', function (assert) {
    function NullObject() {}
    NullObject.prototype = Object.create(null, {
      constructor: {
        value: null,
      },
    });

    var a = new NullObject();
    a.foo = 1;
    var b = { foo: 1 };

    assert.deepEqual(a, b);
    assert.deepEqual(b, a);
  });

  test('Arrays basics', function (assert) {
    assert.deepEqual([], []);

    assert.notDeepEqual([], null);
    assert.notDeepEqual([], undefined);
    assert.notDeepEqual([], false);
    assert.notDeepEqual([], 0);
    assert.notDeepEqual([], '');

    assert.notDeepEqual([], {});

    assert.notDeepEqual([null], []);
    assert.notDeepEqual([undefined], []);
    assert.notDeepEqual([], [null]);
    assert.notDeepEqual([], [undefined]);
    assert.notDeepEqual([null], [undefined]);
    assert.deepEqual([[]], [[]]);
    assert.deepEqual([[], [], []], [[], [], []]);

    assert.deepEqual(
      [[], [], [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]],
      [[], [], [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]],
    );

    assert.notDeepEqual(
      [[], [], [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]],
      [[], [], [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]],
    );

    assert.notDeepEqual(
      [[], [], [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[{}]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]],
      [[], [], [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]], // deepest element not an array
    );

    assert.deepEqual(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, [
        1, 2, 3, 4, 5, 6, 7, 8, 9, [
          1, 2, 3, 4, 5, [
            [6, 7, 8, 9, [
              [
                1, 2, 3, 4, [
                  2, 3, 4, [
                    1, 2, [
                      1, 2, 3, 4, [
                        1, 2, 3, 4, 5, 6, 7, 8, 9, [
                          0
                        ], 1, 2, 3, 4, 5, 6, 7, 8, 9
                      ], 5, 6, 7, 8, 9
                    ], 4, 5, 6, 7, 8, 9
                  ], 5, 6, 7, 8, 9
                ], 5, 6, 7
              ]
            ]
            ]
          ]
        ]]],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, [
        1, 2, 3, 4, 5, 6, 7, 8, 9, [
          1, 2, 3, 4, 5, [
            [6, 7, 8, 9, [
              [
                1, 2, 3, 4, [
                  2, 3, 4, [
                    1, 2, [
                      1, 2, 3, 4, [
                        1, 2, 3, 4, 5, 6, 7, 8, 9, [
                          0
                        ], 1, 2, 3, 4, 5, 6, 7, 8, 9
                      ], 5, 6, 7, 8, 9
                    ], 4, 5, 6, 7, 8, 9
                  ], 5, 6, 7, 8, 9
                ], 5, 6, 7
              ]
            ]
            ]
          ]
        ]]]
    );

    assert.notDeepEqual(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, [
        1, 2, 3, 4, 5, 6, 7, 8, 9, [
          1, 2, 3, 4, 5, [
            [6, 7, 8, 9, [
              [
                1, 2, 3, 4, [
                  2, 3, 4, [
                    1, 2, [
                      1, 2, 3, 4, [
                        1, 2, 3, 4, 5, 6, 7, 8, 9, [
                          0
                        ], 1, 2, 3, 4, 5, 6, 7, 8, 9
                      ], 5, 6, 7, 8, 9
                    ], 4, 5, 6, 7, 8, 9
                  ], 5, 6, 7, 8, 9
                ], 5, 6, 7
              ]
            ]
            ]
          ]
        ]]],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, [
        1, 2, 3, 4, 5, 6, 7, 8, 9, [
          1, 2, 3, 4, 5, [
            [6, 7, 8, 9, [
              [
                1, 2, 3, 4, [
                  2, 3, 4, [
                    1, 2, [
                      '1', 2, 3, 4, [ // string instead of number
                        1, 2, 3, 4, 5, 6, 7, 8, 9, [
                          0
                        ], 1, 2, 3, 4, 5, 6, 7, 8, 9
                      ], 5, 6, 7, 8, 9
                    ], 4, 5, 6, 7, 8, 9
                  ], 5, 6, 7, 8, 9
                ], 5, 6, 7
              ]
            ]
            ]
          ]
        ]]]
    );

    assert.notDeepEqual(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, [
        1, 2, 3, 4, 5, 6, 7, 8, 9, [
          1, 2, 3, 4, 5, [
            [6, 7, 8, 9, [
              [
                1, 2, 3, 4, [
                  2, 3, 4, [
                    1, 2, [
                      1, 2, 3, 4, [
                        1, 2, 3, 4, 5, 6, 7, 8, 9, [
                          0
                        ], 1, 2, 3, 4, 5, 6, 7, 8, 9
                      ], 5, 6, 7, 8, 9
                    ], 4, 5, 6, 7, 8, 9
                  ], 5, 6, 7, 8, 9
                ], 5, 6, 7
              ]
            ]
            ]
          ]
        ]]],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, [
        1, 2, 3, 4, 5, 6, 7, 8, 9, [
          1, 2, 3, 4, 5, [
            [6, 7, 8, 9, [
              [
                1, 2, 3, 4, [
                  2, 3, [ // missing an element (4)
                    1, 2, [
                      1, 2, 3, 4, [
                        1, 2, 3, 4, 5, 6, 7, 8, 9, [
                          0
                        ], 1, 2, 3, 4, 5, 6, 7, 8, 9
                      ], 5, 6, 7, 8, 9
                    ], 4, 5, 6, 7, 8, 9
                  ], 5, 6, 7, 8, 9
                ], 5, 6, 7
              ]
            ]
            ]
          ]
        ]]]
    );
  });

  test('Functions', function (assert) {
    var f0 = function () {};
    var f1 = function () {};

    var f2 = function () {
      return 0;
    };
    var f3 = function () {
      // eslint-disable-next-line semi
      return 0; // this comment and no semicoma as difference
    };

    assert.notDeepEqual(
      function () {},
      function () {},
    );
    assert.notDeepEqual(
      function () {},
      function () {
        return true;
      },
    );

    assert.deepEqual(f0, f0);
    assert.notDeepEqual(f0, f1);
    assert.notDeepEqual(f2, f3);
    assert.notDeepEqual(f1, f2);
    assert.notDeepEqual(function () {}, true);
    assert.notDeepEqual(function () {}, undefined);
    assert.notDeepEqual(function () {}, null);
    assert.notDeepEqual(function () {}, {});
  });

  test('Date instances', function (assert) {
    var d1, d2, d3;

    d1 = new Date();
    d1.setTime(0);

    d2 = new Date();
    d2.setTime(0);

    d3 = new Date();

    assert.notDeepEqual(d1, 0);
    assert.deepEqual(d1, d2);
    assert.notDeepEqual(d1, d3);
  });

  test('RegExp', function (assert) {
    var regex1, regex2, regex3, r3a, r3b, ru1, ru2;
    var r1 = /foo/;
    var r2 = /foo/gim;
    var r3 = /foo/gim;
    var r4 = /foo/gim;
    var r5 = /foo/gim;
    var r6 = /foo/gim;
    var r7 = /foo/gim;
    var ri1 = /foo/i;
    var ri2 = /foo/i;
    var rm1 = /foo/m;
    var rm2 = /foo/m;
    var rg1 = /foo/g;
    var rg2 = /foo/g;

    assert.deepEqual(r2, r3, 'Modifier order');
    assert.deepEqual(r2, r4, 'Modifier order');
    assert.deepEqual(r2, r5, 'Modifier order');
    assert.deepEqual(r2, r6, 'Modifier order');
    assert.deepEqual(r2, r7, 'Modifier order');
    assert.notDeepEqual(r1, r2, 'Modifier');

    assert.deepEqual(ri1, ri2, 'Modifier');
    assert.notDeepEqual(r1, ri1, 'Modifier');
    assert.notDeepEqual(ri1, rm1, 'Modifier');
    assert.notDeepEqual(r1, rm1, 'Modifier');
    assert.notDeepEqual(rm1, ri1, 'Modifier');
    assert.deepEqual(rm1, rm2, 'Modifier');
    assert.notDeepEqual(rg1, rm1, 'Modifier');
    assert.notDeepEqual(rm1, rg1, 'Modifier');
    assert.deepEqual(rg1, rg2, 'Modifier');

    try {
      r2 = new RegExp('foo', 'umig');
      r3 = new RegExp('foo', 'mgiu');
      assert.deepEqual(r2, r3, 'Modifier order');
      assert.notDeepEqual(r1, r2, 'Modifier');

      ru1 = new RegExp('\\u{1D306}', 'u');
      ru2 = new RegExp('\\u{1D306}', 'u');
      assert.notDeepEqual(ru1, rg1, 'Modifier');
      assert.notDeepEqual(rg1, ru1, 'Modifier');
      assert.deepEqual(ru1, ru2, 'Modifier');
    } catch (e) {}

    r1 = /[a-z]/gi;
    r2 = /[0-9]/gi;
    assert.notDeepEqual(r1, r2, 'Regex pattern');

    r1 = /0/gi;
    r2 = /"0"/gi;
    assert.notDeepEqual(r1, r2, 'Regex pattern');

    r1 = /[\n\r\u2028\u2029]/g;
    r2 = /[\n\r\u2028\u2029]/g;
    r3 = /[\n\r\u2028\u2028]/g;
    r4 = /[\n\r\u2028\u2029]/;
    assert.deepEqual(r1, r2, 'Regex pattern');
    assert.notDeepEqual(r1, r3, 'Regex pattern');
    assert.notDeepEqual(r1, r4, 'Regex pattern');

    regex1 =
      '^[-_.a-z0-9]+@([-_a-z0-9]+\\.)+([A-Za-z][A-Za-z]|[A-Za-z][A-Za-z][A-Za-z])|(([0-9][0-9]?|[0-1][0-9][0-9]|[2][0-4][0-9]|[2][5][0-5]))$';
    regex2 =
      '^[-_.a-z0-9]+@([-_a-z0-9]+\\.)+([A-Za-z][A-Za-z]|[A-Za-z][A-Za-z][A-Za-z])|(([0-9][0-9]?|[0-1][0-9][0-9]|[2][0-4][0-9]|[2][5][0-5]))$';
    regex3 =
      '^[-_.a-z0-9]+@([-_a-z0-9]+.)+([A-Za-z][A-Za-z]|[A-Za-z][A-Za-z][A-Za-z])|(([0-9][0-9]?|[0-1][0-9][0-9]|[2][0-4][0-9]|[2][5][0-5]))$';

    r1 = new RegExp(regex1);
    r2 = new RegExp(regex2);
    r3 = new RegExp(regex3);
    r3a = new RegExp(regex3, 'gi');
    r3b = new RegExp(regex3, 'ig');

    assert.deepEqual(r1, r2, 'Complex Regex');
    assert.notDeepEqual(r1, r3, 'Complex Regex');
    assert.notDeepEqual(r3, r3a, 'Complex Regex');
    assert.deepEqual(r3a, r3b, 'Complex Regex');

    r1 = / /;
    assert.notDeepEqual(r1, function () {}, 'Regex internal');
    assert.notDeepEqual(r1, {}, 'Regex internal');
  });

  test('Complex objects', function (assert) {
    function fn1() {
      return 'fn1';
    }
    function fn2() {
      return 'fn2';
    }

    assert.deepEqual(
      {
        a: 1,
        b: null,
        c: [{}],
        d: {
          a: 3.14159,
          b: false,
          c: {
            e: fn1,
            f: [[[]]],
            g: {
              j: {
                k: {
                  n: {
                    r: 'r',
                    s: [1, 2, 3],
                    t: undefined,
                    u: 0,
                    v: {
                      w: {
                        x: {
                          y: 'Yahoo!',
                          z: null,
                        },
                      },
                    },
                  },
                  q: [],
                  p: 1 / 0,
                  o: 99,
                },
                l: undefined,
                m: null,
              },
            },
            d: 0,
            i: true,
            h: 'false',
          },
        },
        e: undefined,
        g: '',
        h: 'h',
        f: {},
        i: [],
      },
      {
        a: 1,
        b: null,
        c: [{}],
        d: {
          b: false,
          a: 3.14159,
          c: {
            d: 0,
            e: fn1,
            f: [[[]]],
            g: {
              j: {
                k: {
                  n: {
                    r: 'r',
                    t: undefined,
                    u: 0,
                    s: [1, 2, 3],
                    v: {
                      w: {
                        x: {
                          z: null,
                          y: 'Yahoo!',
                        },
                      },
                    },
                  },
                  o: 99,
                  p: 1 / 0,
                  q: [],
                },
                l: undefined,
                m: null,
              },
            },
            i: true,
            h: 'false',
          },
        },
        e: undefined,
        g: '',
        f: {},
        h: 'h',
        i: [],
      },
    );

    assert.notDeepEqual(
      {
        a: 1,
        b: null,
        c: [{}],
        d: {
          a: 3.14159,
          b: false,
          c: {
            d: 0,
            e: fn1,
            f: [[[]]],
            g: {
              j: {
                k: {
                  n: {
                    // r: "r", // different: missing a property
                    s: [1, 2, 3],
                    t: undefined,
                    u: 0,
                    v: {
                      w: {
                        x: {
                          y: 'Yahoo!',
                          z: null,
                        },
                      },
                    },
                  },
                  o: 99,
                  p: 1 / 0,
                  q: [],
                },
                l: undefined,
                m: null,
              },
            },
            h: 'false',
            i: true,
          },
        },
        e: undefined,
        f: {},
        g: '',
        h: 'h',
        i: [],
      },
      {
        a: 1,
        b: null,
        c: [{}],
        d: {
          a: 3.14159,
          b: false,
          c: {
            d: 0,
            e: fn1,
            f: [[[]]],
            g: {
              j: {
                k: {
                  n: {
                    r: 'r',
                    s: [1, 2, 3],
                    t: undefined,
                    u: 0,
                    v: {
                      w: {
                        x: {
                          y: 'Yahoo!',
                          z: null,
                        },
                      },
                    },
                  },
                  o: 99,
                  p: 1 / 0,
                  q: [],
                },
                l: undefined,
                m: null,
              },
            },
            h: 'false',
            i: true,
          },
        },
        e: undefined,
        f: {},
        g: '',
        h: 'h',
        i: [],
      },
    );

    assert.notDeepEqual(
      {
        a: 1,
        b: null,
        c: [{}],
        d: {
          a: 3.14159,
          b: false,
          c: {
            d: 0,
            e: fn1,
            f: [[[]]],
            g: {
              j: {
                k: {
                  n: {
                    r: 'r',
                    s: [1, 2, 3],
                    t: undefined,
                    u: 0,
                    v: {
                      w: {
                        x: {
                          y: 'Yahoo!',
                          z: null,
                        },
                      },
                    },
                  },
                  o: 99,
                  p: 1 / 0,
                  q: [],
                },
                l: undefined,
                m: null,
              },
            },
            h: 'false',
            i: true,
          },
        },
        e: undefined,
        f: {},
        g: '',
        h: 'h',
        i: [],
      },
      {
        a: 1,
        b: null,
        c: [{}],
        d: {
          a: 3.14159,
          b: false,
          c: {
            d: 0,
            e: fn1,
            f: [[[]]],
            g: {
              j: {
                k: {
                  n: {
                    r: 'r',
                    s: [1, 2, 3],
                    // t: undefined,
                    u: 0,
                    v: {
                      w: {
                        x: {
                          y: 'Yahoo!',
                          z: null,
                        },
                      },
                    },
                  },
                  o: 99,
                  p: 1 / 0,
                  q: [],
                },
                l: undefined,
                m: null,
              },
            },
            h: 'false',
            i: true,
          },
        },
        e: undefined,
        f: {},
        g: '',
        h: 'h',
        i: [],
      },
    );

    assert.notDeepEqual(
      {
        a: 1,
        b: null,
        c: [{}],
        d: {
          a: 3.14159,
          b: false,
          c: {
            d: 0,
            e: fn1,
            f: [[[]]],
            g: {
              j: {
                k: {
                  n: {
                    r: 'r',
                    s: [1, 2, 3],
                    t: undefined,
                    u: 0,
                    v: {
                      w: {
                        x: {
                          y: 'Yahoo!',
                          z: null,
                        },
                      },
                    },
                  },
                  o: 99,
                  p: 1 / 0,
                  q: [],
                },
                l: undefined,
                m: null,
              },
            },
            h: 'false',
            i: true,
          },
        },
        e: undefined,
        f: {},
        g: '',
        h: 'h',
        i: [],
      },
      {
        a: 1,
        b: null,
        c: [{}],
        d: {
          a: 3.14159,
          b: false,
          c: {
            d: 0,
            e: fn1,
            f: [[[]]],
            g: {
              j: {
                k: {
                  n: {
                    r: 'r',
                    s: [1, 2, 3],
                    t: undefined,
                    u: 0,
                    v: {
                      w: {
                        x: {
                          y: 'Yahoo!',
                          z: null,
                        },
                      },
                    },
                  },
                  o: 99,
                  p: 1 / 0,
                  q: {}, // different was []
                },
                l: undefined,
                m: null,
              },
            },
            h: 'false',
            i: true,
          },
        },
        e: undefined,
        f: {},
        g: '',
        h: 'h',
        i: [],
      },
    );

    var same1 = {
      a: [
        'string',
        null,
        0,
        '1',
        1,
        {
          prop: null,
          foo: [1, 2, null, {}, [], [1, 2, 3]],
          bar: undefined,
        },
        3,
        'Hey!',
        'ÎšÎ¬Î½Îµ Ï€Î¬Î½Ï„Î± Î³Î½Ï‰ÏÎ¯Î¶Î¿Ï…Î¼Îµ Î±Ï‚ Ï„Ï‰Î½, Î¼Î·Ï‡Î±Î½Î®Ï‚ ÎµÏ€Î¹Î´Î¹ÏŒÏÎ¸Ï‰ÏƒÎ·Ï‚ ÎµÏ€Î¹Î´Î¹Î¿ÏÎ¸ÏŽÏƒÎµÎ¹Ï‚ ÏŽÏ‚ Î¼Î¹Î±. ÎšÎ»Ï€ Î±Ï‚',
      ],
      unicode:
        'è€ æ±‰è¯ä¸å˜åœ¨ æ¸¯æ¾³å’Œæµ·å¤–çš„åŽäººåœˆä¸ è´µå·ž æˆ‘åŽ»äº†ä¹¦åº— çŽ°åœ¨å°šæœ‰äº‰',
      b: 'b',
      c: fn1,
    };

    var same2 = {
      a: [
        'string',
        null,
        0,
        '1',
        1,
        {
          prop: null,
          foo: [1, 2, null, {}, [], [1, 2, 3]],
          bar: undefined,
        },
        3,
        'Hey!',
        'ÎšÎ¬Î½Îµ Ï€Î¬Î½Ï„Î± Î³Î½Ï‰ÏÎ¯Î¶Î¿Ï…Î¼Îµ Î±Ï‚ Ï„Ï‰Î½, Î¼Î·Ï‡Î±Î½Î®Ï‚ ÎµÏ€Î¹Î´Î¹ÏŒÏÎ¸Ï‰ÏƒÎ·Ï‚ ÎµÏ€Î¹Î´Î¹Î¿ÏÎ¸ÏŽÏƒÎµÎ¹Ï‚ ÏŽÏ‚ Î¼Î¹Î±. ÎšÎ»Ï€ Î±Ï‚',
      ],
      unicode:
        'è€ æ±‰è¯ä¸å˜åœ¨ æ¸¯æ¾³å’Œæµ·å¤–çš„åŽäººåœˆä¸ è´µå·ž æˆ‘åŽ»äº†ä¹¦åº— çŽ°åœ¨å°šæœ‰äº‰',
      b: 'b',
      c: fn1,
    };

    var diff1 = {
      a: [
        'string',
        null,
        0,
        '1',
        1,
        {
          prop: null,
          foo: [1, 2, null, {}, [], [1, 2, 3, 4]], // different: 4 was add to the array
          bar: undefined,
        },
        3,
        'Hey!',
        'ÎšÎ¬Î½Îµ Ï€Î¬Î½Ï„Î± Î³Î½Ï‰ÏÎ¯Î¶Î¿Ï…Î¼Îµ Î±Ï‚ Ï„Ï‰Î½, Î¼Î·Ï‡Î±Î½Î®Ï‚ ÎµÏ€Î¹Î´Î¹ÏŒÏÎ¸Ï‰ÏƒÎ·Ï‚ ÎµÏ€Î¹Î´Î¹Î¿ÏÎ¸ÏŽÏƒÎµÎ¹Ï‚ ÏŽÏ‚ Î¼Î¹Î±. ÎšÎ»Ï€ Î±Ï‚',
      ],
      unicode:
        'è€ æ±‰è¯ä¸å˜åœ¨ æ¸¯æ¾³å’Œæµ·å¤–çš„åŽäººåœˆä¸ è´µå·ž æˆ‘åŽ»äº†ä¹¦åº— çŽ°åœ¨å°šæœ‰äº‰',
      b: 'b',
      c: fn1,
    };

    var diff2 = {
      a: [
        'string',
        null,
        0,
        '1',
        1,
        {
          prop: null,
          foo: [1, 2, null, {}, [], [1, 2, 3]],
          newprop: undefined, // different: newprop was added
          bar: undefined,
        },
        3,
        'Hey!',
        'ÎšÎ¬Î½Îµ Ï€Î¬Î½Ï„Î± Î³Î½Ï‰ÏÎ¯Î¶Î¿Ï…Î¼Îµ Î±Ï‚ Ï„Ï‰Î½, Î¼Î·Ï‡Î±Î½Î®Ï‚ ÎµÏ€Î¹Î´Î¹ÏŒÏÎ¸Ï‰ÏƒÎ·Ï‚ ÎµÏ€Î¹Î´Î¹Î¿ÏÎ¸ÏŽÏƒÎµÎ¹Ï‚ ÏŽÏ‚ Î¼Î¹Î±. ÎšÎ»Ï€ Î±Ï‚',
      ],
      unicode:
        'è€ æ±‰è¯ä¸å˜åœ¨ æ¸¯æ¾³å’Œæµ·å¤–çš„åŽäººåœˆä¸ è´µå·ž æˆ‘åŽ»äº†ä¹¦åº— çŽ°åœ¨å°šæœ‰äº‰',
      b: 'b',
      c: fn1,
    };

    var diff3 = {
      a: [
        'string',
        null,
        0,
        '1',
        1,
        {
          prop: null,
          foo: [1, 2, null, {}, [], [1, 2, 3]],
          bar: undefined,
        },
        3,
        'Hey!',
        'ÎšÎ¬Î½Îµ Ï€Î¬Î½Ï„Î± Î³Î½Ï‰ÏÎ¯Î¶Î¿Ï…Î¼Îµ Î±Ï‚ Ï„Ï‰Î½, Î¼Î·Ï‡Î±Î½Î®Ï‚ ÎµÏ€Î¹Î´Î¹ÏŒÏÎ¸Ï‰ÏƒÎ·Ï‚ ÎµÏ€Î¹Î´Î¹Î¿ÏÎ¸ÏŽÏƒÎµÎ¹Ï‚ ÏŽÏ‚ Î¼Î¹Î±. ÎšÎ»Ï€ Î±', // different: missing last char
      ],
      unicode:
        'è€ æ±‰è¯ä¸å˜åœ¨ æ¸¯æ¾³å’Œæµ·å¤–çš„åŽäººåœˆä¸ è´µå·ž æˆ‘åŽ»äº†ä¹¦åº— çŽ°åœ¨å°šæœ‰äº‰',
      b: 'b',
      c: fn1,
    };

    var diff4 = {
      a: [
        'string',
        null,
        0,
        '1',
        1,
        {
          prop: null,
          foo: [1, 2, undefined, {}, [], [1, 2, 3]], // different: undefined instead of null
          bar: undefined,
        },
        3,
        'Hey!',
        'ÎšÎ¬Î½Îµ Ï€Î¬Î½Ï„Î± Î³Î½Ï‰ÏÎ¯Î¶Î¿Ï…Î¼Îµ Î±Ï‚ Ï„Ï‰Î½, Î¼Î·Ï‡Î±Î½Î®Ï‚ ÎµÏ€Î¹Î´Î¹ÏŒÏÎ¸Ï‰ÏƒÎ·Ï‚ ÎµÏ€Î¹Î´Î¹Î¿ÏÎ¸ÏŽÏƒÎµÎ¹Ï‚ ÏŽÏ‚ Î¼Î¹Î±. ÎšÎ»Ï€ Î±Ï‚',
      ],
      unicode:
        'è€ æ±‰è¯ä¸å˜åœ¨ æ¸¯æ¾³å’Œæµ·å¤–çš„åŽäººåœˆä¸ è´µå·ž æˆ‘åŽ»äº†ä¹¦åº— çŽ°åœ¨å°šæœ‰äº‰',
      b: 'b',
      c: fn1,
    };

    var diff5 = {
      a: [
        'string',
        null,
        0,
        '1',
        1,
        {
          prop: null,
          foo: [1, 2, null, {}, [], [1, 2, 3]],
          bat: undefined, // different: property name not "bar"
        },
        3,
        'Hey!',
        'ÎšÎ¬Î½Îµ Ï€Î¬Î½Ï„Î± Î³Î½Ï‰ÏÎ¯Î¶Î¿Ï…Î¼Îµ Î±Ï‚ Ï„Ï‰Î½, Î¼Î·Ï‡Î±Î½Î®Ï‚ ÎµÏ€Î¹Î´Î¹ÏŒÏÎ¸Ï‰ÏƒÎ·Ï‚ ÎµÏ€Î¹Î´Î¹Î¿ÏÎ¸ÏŽÏƒÎµÎ¹Ï‚ ÏŽÏ‚ Î¼Î¹Î±. ÎšÎ»Ï€ Î±Ï‚',
      ],
      unicode:
        'è€ æ±‰è¯ä¸å˜åœ¨ æ¸¯æ¾³å’Œæµ·å¤–çš„åŽäººåœˆä¸ è´µå·ž æˆ‘åŽ»äº†ä¹¦åº— çŽ°åœ¨å°šæœ‰äº‰',
      b: 'b',
      c: fn1,
    };

    var diff6 = {
      a: [
        'string',
        null,
        0,
        '1',
        1,
        {
          prop: null,
          foo: [1, 2, null, {}, [], [1, 2, 3]],
          bar: undefined,
        },
        3,
        'Hey!',
        'ÎšÎ¬Î½Îµ Ï€Î¬Î½Ï„Î± Î³Î½Ï‰ÏÎ¯Î¶Î¿Ï…Î¼Îµ Î±Ï‚ Ï„Ï‰Î½, Î¼Î·Ï‡Î±Î½Î®Ï‚ ÎµÏ€Î¹Î´Î¹ÏŒÏÎ¸Ï‰ÏƒÎ·Ï‚ ÎµÏ€Î¹Î´Î¹Î¿ÏÎ¸ÏŽÏƒÎµÎ¹Ï‚ ÏŽÏ‚ Î¼Î¹Î±. ÎšÎ»Ï€ Î±Ï‚',
      ],
      unicode:
        'è€ æ±‰è¯ä¸å˜åœ¨ æ¸¯æ¾³å’Œæµ·å¤–çš„åŽäººåœˆä¸ è´µå·ž æˆ‘åŽ»äº†ä¹¦åº— çŽ°åœ¨å°šæœ‰äº‰',
      b: 'b',
      c: fn2, // different: fn2 instead of fn1
    };

    assert.deepEqual(same1, same2);
    assert.deepEqual(same2, same1);
    assert.notDeepEqual(same2, diff1);
    assert.notDeepEqual(diff1, same2);
    assert.notDeepEqual(same2, diff2);
    assert.notDeepEqual(diff2, same2);
    assert.notDeepEqual(same2, diff3);
    assert.notDeepEqual(diff3, same2);
    assert.notDeepEqual(same2, diff4);
    assert.notDeepEqual(diff4, same2);
    assert.notDeepEqual(same2, diff5);
    assert.notDeepEqual(diff5, same2);
    assert.notDeepEqual(same2, diff6);
    assert.notDeepEqual(diff6, same2);
  });

  test('Complex Arrays', function (assert) {
    function fn() {}

    assert.deepEqual(
      [
        1,
        2,
        3,
        true,
        {},
        null,
        [
          {
            a: ['', '1', 0],
          },
          5,
          6,
          7,
        ],
        'foo',
      ],
      [
        1,
        2,
        3,
        true,
        {},
        null,
        [
          {
            a: ['', '1', 0],
          },
          5,
          6,
          7,
        ],
        'foo',
      ],
    );

    assert.notDeepEqual(
      [
        1,
        2,
        3,
        true,
        {},
        null,
        [
          {
            a: ['', '1', 0],
          },
          5,
          6,
          7,
        ],
        'foo',
      ],
      [
        1,
        2,
        3,
        true,
        {},
        null,
        [
          {
            b: ['', '1', 0], // not the same property name
          },
          5,
          6,
          7,
        ],
        'foo',
      ],
    );

    var a = [
      {
        b: fn,
        c: false,
        do: 'reserved word',
        for: {
          ar: [
            3,
            5,
            9,
            'hey!',
            [],
            {
              ar: [1, [3, 4, 6, 9, null, [], []]],
              e: fn,
              f: undefined,
            },
          ],
        },
        e: 0.43445,
      },
      5,
      'string',
      0,
      fn,
      false,
      null,
      undefined,
      0,
      [4, 5, 6, 7, 8, 9, 11, 22, 33, 44, 55, '66', null, [], [[[[[3]]]], '3'], {}, 1 / 0],
      [],
      [
        [
          [],
          'foo',
          null,
          {
            n: 1 / 0,
            z: {
              a: [3, 4, 5, 6, 'yep!', undefined, undefined],
              b: {},
            },
          },
          {},
        ],
      ],
    ];

    assert.deepEqual(a, [
      {
        b: fn,
        c: false,
        do: 'reserved word',
        for: {
          ar: [
            3,
            5,
            9,
            'hey!',
            [],
            {
              ar: [1, [3, 4, 6, 9, null, [], []]],
              e: fn,
              f: undefined,
            },
          ],
        },
        e: 0.43445,
      },
      5,
      'string',
      0,
      fn,
      false,
      null,
      undefined,
      0,
      [4, 5, 6, 7, 8, 9, 11, 22, 33, 44, 55, '66', null, [], [[[[[3]]]], '3'], {}, 1 / 0],
      [],
      [
        [
          [],
          'foo',
          null,
          {
            n: 1 / 0,
            z: {
              a: [3, 4, 5, 6, 'yep!', undefined, undefined],
              b: {},
            },
          },
          {},
        ],
      ],
    ]);

    assert.notDeepEqual(a, [
      {
        b: fn,
        c: false,
        do: 'reserved word',
        for: {
          ar: [
            3,
            5,
            9,
            'hey!',
            [],
            {
              ar: [1, [3, 4, 6, 9, null, [], []]],
              e: fn,
              f: undefined,
            },
          ],
        },
        e: 0.43445,
      },
      5,
      'string',
      0,
      fn,
      false,
      null,
      undefined,
      0,
      [
        4,
        5,
        6,
        7,
        8,
        9,
        11,
        22,
        33,
        44,
        55,
        '66',
        null,
        [],
        [[[[[2]]]], '3'],
        {},
        1 / 0,
        // different: [[[[[2]]]]] instead of [[[[[3]]]]]
      ],
      [],
      [
        [
          [],
          'foo',
          null,
          {
            n: 1 / 0,
            z: {
              a: [3, 4, 5, 6, 'yep!', undefined, undefined],
              b: {},
            },
          },
          {},
        ],
      ],
    ]);

    assert.notDeepEqual(a, [
      {
        b: fn,
        c: false,
        do: 'reserved word',
        for: {
          ar: [
            3,
            5,
            9,
            'hey!',
            [],
            {
              ar: [1, [3, 4, 6, 9, null, [], []]],
              e: fn,
              f: undefined,
            },
          ],
        },
        e: 0.43445,
      },
      5,
      'string',
      0,
      fn,
      false,
      null,
      undefined,
      0,
      [4, 5, 6, 7, 8, 9, 11, 22, 33, 44, 55, '66', null, [], [[[[[3]]]], '3'], {}, 1 / 0],
      [],
      [
        [
          [],
          'foo',
          null,
          {
            n: -1 / 0, // different, -Infinity instead of Infinity
            z: {
              a: [3, 4, 5, 6, 'yep!', undefined, undefined],
              b: {},
            },
          },
          {},
        ],
      ],
    ]);

    assert.notDeepEqual(a, [
      {
        b: fn,
        c: false,
        do: 'reserved word',
        for: {
          ar: [
            3,
            5,
            9,
            'hey!',
            [],
            {
              ar: [1, [3, 4, 6, 9, null, [], []]],
              e: fn,
              f: undefined,
            },
          ],
        },
        e: 0.43445,
      },
      5,
      'string',
      0,
      fn,
      false,
      null,
      undefined,
      0,
      [4, 5, 6, 7, 8, 9, 11, 22, 33, 44, 55, '66', null, [], [[[[[3]]]], '3'], {}, 1 / 0],
      [],
      [
        [
          [],
          'foo',
          {
            // different: null is missing
            n: 1 / 0,
            z: {
              a: [3, 4, 5, 6, 'yep!', undefined, undefined],
              b: {},
            },
          },
          {},
        ],
      ],
    ]);

    assert.notDeepEqual(a, [
      {
        b: fn,
        c: false,
        do: 'reserved word',
        for: {
          ar: [
            3,
            5,
            9,
            'hey!',
            [],
            {
              ar: [1, [3, 4, 6, 9, null, [], []]],
              e: fn,
              // different: missing property f: undefined
            },
          ],
        },
        e: 0.43445,
      },
      5,
      'string',
      0,
      fn,
      false,
      null,
      undefined,
      0,
      [4, 5, 6, 7, 8, 9, 11, 22, 33, 44, 55, '66', null, [], [[[[[3]]]], '3'], {}, 1 / 0],
      [],
      [
        [
          [],
          'foo',
          null,
          {
            n: 1 / 0,
            z: {
              a: [3, 4, 5, 6, 'yep!', undefined, undefined],
              b: {},
            },
          },
          {},
        ],
      ],
    ]);
  });

  test('Prototypal inheritance', function (assert) {
    function Gizmo(id) {
      this.id = id;
    }

    function Hoozit(id) {
      this.id = id;
    }
    Hoozit.prototype = new Gizmo();

    var gizmo = new Gizmo('ok');
    var hoozit = new Hoozit('ok');

    // Try this test many times after test on instances that hold function
    // to make sure that our code does not mess with last object constructor memoization.
    assert.notDeepEqual(
      function () {},
      function () {},
    );

    // Hoozit inherit from Gizmo
    // hoozit instanceof Hoozit; // true
    // hoozit instanceof Gizmo; // true
    assert.deepEqual(hoozit, gizmo);

    Gizmo.prototype.bar = true; // not a function just in case we skip them

    // Hoozit inherit from Gizmo
    // They are equivalent
    assert.deepEqual(hoozit, gizmo);

    // Make sure this is still true !important
    // The reason for this is that I forgot to reset the last
    // caller to where it were called from.
    assert.notDeepEqual(
      function () {},
      function () {},
    );

    // Make sure this is still true !important
    assert.deepEqual(hoozit, gizmo);

    Hoozit.prototype.foo = true; // not a function just in case we skip them

    // Gizmo does not inherit from Hoozit
    // gizmo instanceof Gizmo; // true
    // gizmo instanceof Hoozit; // false
    // They are not equivalent
    assert.notDeepEqual(hoozit, gizmo);

    // Make sure this is still true !important
    assert.notDeepEqual(
      function () {},
      function () {},
    );
  });

  test('Prototypal inheritance imposter', function (assert) {
    // Bar is a subclass of Foo that very loosely tries to hide itself
    // as intermediary prototype by not adding or overriding any methods
    // and not adding or overriding any instance properties, except to
    // assign obj.constructor as Foo.
    //
    // This is a regression test for https://github.com/qunitjs/qunit/issues/1706.
    //
    // We may change this behaviour in a future major version, but for now
    // ensure the behaviour does not change unintentionally.
    //
    // This difference has very low impact, given that any added methods
    // or properties will result in non-equality regardless of
    // obj.constructor being equal given that equiv() iterates and
    // compares all own and inherited properties in a single pass.
    // The only observable difference would be `instanceof` (in one
    // direction) and possibly presence of non-enumerable properties.
    function Foo(id) {
      this.id = id;

      // Make subclass Bar pretend to be Foo in terms of obj.constructor,
      // thus very loosely hiding that it is an intermediary prototype.
      this.constructor = Foo;
    }
    Foo.prototype.constructor = Foo;

    function Bar(id) {
      Foo.call(this, id);
    }
    Bar.prototype = Object.create(Foo.prototype);
    Bar.prototype.constructor = Bar;

    assert.deepEqual(new Foo(4), new Bar(4));
  });

  test('Instances', function (assert) {
    var a1, a2, b1, b2, c1, c2, c3, car, carSame, carDiff, human;

    function A() {}
    a1 = new A();
    a2 = new A();

    function B() {
      this.fn = function () {};
    }
    b1 = new B();
    b2 = new B();

    function C(fn) {
      this.fn = fn;
    }

    c1 = new C(function () {
      return true;
    });
    c2 = new C(function () {
      return false;
    });
    c3 = new C(function () {
      return true;
    });

    assert.deepEqual(a1, a2, 'Same property, same constructor');

    // b1.fn and b2.fn are functions but they are different references
    // But we decided to skip function for instances.
    assert.deepEqual(b1, b2, 'Same property, same constructor');

    assert.notDeepEqual(c1, c2, 'Same property with different reference and different function');
    assert.deepEqual(c1, c3, 'Same property with different reference but same function');

    // failed
    assert.notDeepEqual(a1, b1, 'Same properties but different constructor');

    function Car(year) {
      var privateVar = 0;
      this.year = year;
      this.isOld = function () {
        return privateVar > 10;
      };
    }

    function Human(year) {
      var privateVar = 1;
      this.year = year;
      this.isOld = function () {
        return privateVar > 80;
      };
    }

    car = new Car(30);
    carSame = new Car(30);
    carDiff = new Car(10);
    human = new Human(30);

    assert.deepEqual(car, car);
    assert.notDeepEqual(car, carDiff);
    assert.deepEqual(car, carSame);
    assert.notDeepEqual(car, human);
  });

  test('Complex instance nesting (with function values in literals and/or in nested instances)', function (assert) {
    var a1, a2, b1, b2, c1, c2, d1, d2, e1, e2;

    function A(fn) {
      this.a = {};
      this.fn = fn;
      this.b = { a: [] };
      this.o = {};
      this.fn1 = fn;
    }
    function B(fn) {
      this.fn = fn;
      this.fn1 = function () {};
      this.a = new A(function () {});
    }

    function fnOutside() {}

    function C(fn) {
      function fnInside() {}
      this.x = 10;
      this.fn = fn;
      this.fn1 = function () {};
      this.fn2 = fnInside;
      this.fn3 = {
        a: true,
        b: fnOutside, // ok make reference to a function in all instances scope
      };
      this.o1 = {};

      // This function will be ignored.
      // Even if it is not visible for all instances (e.g. locked in a closures),
      // it is from a  property that makes part of an instance (e.g. from the C constructor)
      this.b1 = new B(function () {});
      this.b2 = new B({
        x: {
          b2: new B(function () {}),
        },
      });
    }

    function D(fn) {
      function fnInside() {}
      this.x = 10;
      this.fn = fn;
      this.fn1 = function () {};
      this.fn2 = fnInside;
      this.fn3 = {
        a: true,
        b: fnOutside, // ok make reference to a function in all instances scope

        // This function won't be ignored.
        // It isn't visible for all C instances
        // and it is not in a property of an instance.
        // (in an Object instances e.g. the object literal)
        c: fnInside,
      };
      this.o1 = {};

      // This function will be ignored.
      // Even if it is not visible for all instances (e.g. locked in a closures),
      // it is from a  property that makes part of an instance (e.g. from the C constructor)
      this.b1 = new B(function () {});
      this.b2 = new B({
        x: {
          b2: new B(function () {}),
        },
      });
    }

    function E(fn) {
      function fnInside() {}
      this.x = 10;
      this.fn = fn;
      this.fn1 = function () {};
      this.fn2 = fnInside;
      this.fn3 = {
        a: true,
        b: fnOutside, // ok make reference to a function in all instances scope
      };
      this.o1 = {};

      // This function will be ignored.
      // Even if it is not visible for all instances (e.g. locked in a closures),
      // it is from a  property that makes part of an instance (e.g. from the C constructor)
      this.b1 = new B(function () {});
      this.b2 = new B({
        x: {
          b1: new B({ a: function () {} }),
          b2: new B(function () {}),
        },
      });
    }

    a1 = new A(function () {});
    a2 = new A(function () {});
    assert.deepEqual(a1, a2);

    assert.deepEqual(a1, a2); // different instances

    b1 = new B(function () {});
    b2 = new B(function () {});
    assert.deepEqual(b1, b2);

    c1 = new C(function () {});
    c2 = new C(function () {});
    assert.deepEqual(c1, c2);

    d1 = new D(function () {});
    d2 = new D(function () {});
    assert.notDeepEqual(d1, d2);

    e1 = new E(function () {});
    e2 = new E(function () {});
    assert.notDeepEqual(e1, e2);
  });

  test('Object with circular references', function (assert) {
    var circularA = {
      abc: null,
    };
    var circularB = {
      abc: null,
    };
    circularA.abc = circularA;
    circularB.abc = circularB;
    assert.deepEqual(circularA, circularB, 'Should not repeat test on object (ambiguous test)');

    circularA.def = 1;
    circularB.def = 1;
    assert.deepEqual(circularA, circularB, 'Should not repeat test on object (ambiguous test)');

    circularA.def = 1;
    circularB.def = 0;
    assert.notDeepEqual(
      circularA,
      circularB,
      'Should not repeat test on object (unambiguous test)',
    );
  });

  test('Array with circular references', function (assert) {
    var circularA = [];
    var circularB = [];
    circularA.push(circularA);
    circularB.push(circularB);
    assert.deepEqual(circularA, circularB, 'Should not repeat test on array (ambiguous test)');

    circularA.push('abc');
    circularB.push('abc');
    assert.deepEqual(circularA, circularB, 'Should not repeat test on array (ambiguous test)');

    circularA.push('hello');
    circularB.push('goodbye');
    assert.notDeepEqual(circularA, circularB, 'Should not repeat test on array (unambiguous test)');
  });

  test('Mixed object/array with references to self wont loop', function (assert) {
    var circularA = [
      {
        abc: null,
      },
    ];
    var circularB = [
      {
        abc: null,
      },
    ];
    circularA[0].abc = circularA;
    circularB[0].abc = circularB;

    circularA.push(circularA);
    circularB.push(circularB);
    assert.deepEqual(
      circularA,
      circularB,
      'Should not repeat test on object/array (ambiguous test)',
    );

    circularA[0].def = 1;
    circularB[0].def = 1;
    assert.deepEqual(
      circularA,
      circularB,
      'Should not repeat test on object/array (ambiguous test)',
    );

    circularA[0].def = 1;
    circularB[0].def = 0;
    assert.notDeepEqual(
      circularA,
      circularB,
      'Should not repeat test on object/array (unambiguous test)',
    );
  });

  test('Compare self-referent to tree', function (assert) {
    var temp;
    var circularA = [0];
    var treeA = [0, null];
    var circularO = {};
    var treeO = {
      o: null,
    };

    circularA[1] = circularA;
    circularO.o = circularO;

    assert.notDeepEqual(circularA, treeA, 'Array: Should not consider circular equal to tree');
    assert.notDeepEqual(circularO, treeO, 'Object: Should not consider circular equal to tree');

    temp = [0, circularA];
    assert.deepEqual(circularA, temp, 'Array: Reference is circular for one, but equal on other');
    assert.deepEqual(temp, circularA, 'Array: Reference is circular for one, but equal on other');

    temp = {
      o: circularO,
    };
    assert.deepEqual(circularO, temp, 'Object: Reference is circular for one, but equal on other');
    assert.deepEqual(temp, circularO, 'Object: Reference is circular for one, but equal on other');
  });

  test('Compare differently self-referential structures', function (assert) {
    var x = [];
    var y = [];

    x[0] = x;
    y[0] = [y];

    // x is [ x ], y is [ [ y ] ]
    // So both x and y look like [ [ [ [ ... ] ] ] ]
    assert.deepEqual(x, y, 'Equivalent arrays');
    y = [];
    y[0] = [y, 1];

    // x looks like [ [ [ [ ...  ] ] ] ]
    // y looks like [ [ [ [ ... , 1 ] ], 1 ] ]
    assert.notDeepEqual(x, y, 'Nonequivalent arrays');
    x = {};
    y = {};
    x.val = x;
    y.val = { val: y };

    // Both x and y look like { val: { val: { ... } } }
    assert.deepEqual(x, y, 'Equivalent objects');

    // x looks like { val: { val: { val: { val: { ... } } } } }
    // y looks like { val: { val: { val: { val: { ... }, foo: 1 } }, foo: 1 } }
    y.val = { val: y, foo: 1 };
    assert.notDeepEqual(x, y, 'Nonequivalent objects');
  });

  // test('Compare structures with multiple references to the same containers', function (assert) {
  //   console.log({ cool: true, ok: 'haha' });
  //   var i;
  //   var x = {};
  //   var y = {};
  //   for (i = 0; i < 20; i++) {
  //     x = { foo: x, bar: x, baz: x };
  //     y = { foo: y, bar: y, baz: y };
  //   }
  //   assert.deepEqual({ big: x, z: [true] }, { big: y, z: [true] }, 'Equivalent structures');
  //   assert.notDeepEqual({ big: x, z: [true] }, { big: y, z: [false] }, 'Nonequivalent structures');
  // });

  test("Test that must be done at the end because they extend some primitive's prototype", function (assert) {
    // Try that a function looks like our regular expression.
    // This tests if we check that a and b are really both instance of RegExp
    /* eslint-disable no-extend-native */
    Function.prototype.global = true;
    Function.prototype.multiline = true;
    Function.prototype.ignoreCase = false;
    Function.prototype.source = 'my regex';
    var re = /my regex/gm;
    assert.notDeepEqual(re, function () {}, "A function that looks that a regex isn't a regex");

    // This test will ensures it works in both ways,
    // and ALSO especially that we can make differences
    // between RegExp and Function constructor because
    // typeof on a RegExpt instance is "function"
    assert.notDeepEqual(
      function () {},
      re,
      'Same conversely, but ensures that function and regexp are distinct because their constructor are different',
    );
  });

  test('Number objects', function (assert) {
    var SafeNumber = Number;

    assert.deepEqual(
      new SafeNumber(1),
      new SafeNumber(1),
      'Number objects with same values are equivalent.',
    );
    assert.deepEqual(
      new SafeNumber(0 / 0),
      new SafeNumber(0 / 0),
      'NaN Number objects are equivalent.',
    );
    assert.deepEqual(
      new SafeNumber(1 / 0),
      new SafeNumber(2 / 0),
      'Infinite Number objects are equivalent.',
    );

    assert.notDeepEqual(
      new SafeNumber(1),
      new SafeNumber(2),
      'Number objects with different values are not equivalent.',
    );
    assert.notDeepEqual(
      new SafeNumber(0 / 0),
      new SafeNumber(1 / 0),
      'NaN Number objects and infinite Number objects are not equivalent.',
    );
    assert.notDeepEqual(
      new SafeNumber(1 / 0),
      new SafeNumber(-1 / 0),
      'Positive and negative infinite Number objects are not equivalent.',
    );
  });

  test('String objects', function (assert) {
    var SafeString = String;

    assert.deepEqual(
      new SafeString('foo'),
      new SafeString('foo'),
      'String objects with same values are equivalent.',
    );
    assert.deepEqual(
      new SafeString(''),
      new SafeString(''),
      'Empty String objects are equivalent.',
    );

    assert.notDeepEqual(
      new SafeString('foo'),
      new SafeString('bar'),
      'String objects with different values are not equivalent.',
    );
    assert.notDeepEqual(
      new SafeString(''),
      new SafeString('foo'),
      'Empty and nonempty String objects are not equivalent.',
    );
  });

  test('Boolean objects', function (assert) {
    var SafeBoolean = Boolean;

    assert.deepEqual(
      new SafeBoolean(true),
      new SafeBoolean(true),
      'True Boolean objects are equivalent.',
    );
    assert.deepEqual(
      new SafeBoolean(false),
      new SafeBoolean(false),
      'False Boolean objects are equivalent.',
    );

    assert.notDeepEqual(
      new SafeBoolean(true),
      new SafeBoolean(false),
      'Boolean objects with different values are not equivalent.',
    );
  });

  test('Getter', function (assert) {
    var a = {
      get x() {
        return 2;
      },
    };
    var a2 = {
      get x() {
        return 2;
      },
    };
    var b = {
      get x() {
        return 4;
      },
    };
    assert.notDeepEqual(a, b, 'Getters with different values are not equivalent');
    assert.deepEqual(a, a2, 'Same value from different getters are equivalent');

    // Neither the presence of a descriptor nor the descriptor itself is compared
    assert.deepEqual(b, { x: 4 }, 'Getter and literal value are equivalent');
  });

  test('Sets', function (assert) {
    var s1, s2, s3, s4, o1, o2, o3, o4, m1, m2, m3;

    // Empty sets
    s1 = new Set();
    s2 = new Set([]);
    assert.deepEqual(s1, s2, 'Empty sets');

    // Simple cases
    s1 = new Set([1]);
    s2 = new Set([1]);
    s3 = new Set([3]);
    assert.deepEqual(s1, s2, 'Single element sets [1] vs [1]');
    assert.notDeepEqual(s1, s3, 'Single element sets [1] vs [3]');

    // Tricky values
    s1 = new Set([false, undefined, null, 0, Infinity, NaN, -Infinity]);
    s2 = new Set([undefined, null, false, 0, NaN, Infinity, -Infinity]);
    assert.deepEqual(s1, s2, 'Multiple-element sets of tricky values');

    s1 = new Set([1, 3]);
    s2 = new Set([2, 3]);
    assert.notDeepEqual(s1, s2, "Sets can 'short-circuit' for early failure");

    // Sets Containing objects
    o1 = { foo: 0, bar: true };
    o2 = { foo: 0, bar: true };
    o3 = { foo: 1, bar: true };
    o4 = { foo: 1, bar: true };
    s1 = new Set([o1, o3]);
    s2 = new Set([o1, o3]);
    assert.deepEqual(s1, s2, 'Sets containing same objects');
    s1 = new Set([o1]);
    s2 = new Set([o2]);
    assert.deepEqual(s1, s2, 'Sets containing deeply-equal objects');
    s1 = new Set([o1, o3]);
    s2 = new Set([o4, o2]);
    assert.deepEqual(s1, s2, 'Sets containing deeply-equal objects in different insertion order');
    s1 = new Set([o1]);
    s2 = new Set([o3]);
    assert.notDeepEqual(s1, s2, 'Sets containing different objects');

    // Sets containing sets
    s1 = new Set([1, 2, 3]);
    s2 = new Set([1, 2, 3]);
    s3 = new Set([s1]);
    s4 = new Set([s2]);
    assert.deepEqual(s3, s4, 'Sets containing deeply-equal sets');

    // Sets containing different sets
    s1 = new Set([1, 2, 3]);
    s2 = new Set([1, 2, 3, 4]);
    s3 = new Set([s1]);
    s4 = new Set([s2]);
    assert.notDeepEqual(s3, s4, 'Sets containing different sets');

    // Sets containing maps
    m1 = new Map([[1, 1]]);
    m2 = new Map([[1, 1]]);
    m3 = new Map([[1, 3]]);
    s3 = new Set([m1]);
    s4 = new Set([m2]);
    assert.deepEqual(s3, s4, 'Sets containing different but deeply-equal maps');
    s3 = new Set([m1]);
    s4 = new Set([m3]);
    assert.notDeepEqual(s3, s4, 'Sets containing different maps');

    // Sets with different insertion order
    s1 = new Set([1, 2, 3]);
    s2 = new Set([3, 2, 1]);
    assert.deepEqual(s1, s2, 'Sets with different insertion orders');
  });

  test('Maps', function (assert) {
    var m1, m2, m3, m4, o1, o2, o3, o4, s1, s2, s3;

    // Empty maps
    m1 = new Map();
    m2 = new Map([]);
    assert.deepEqual(m1, m2, 'Empty maps');

    // Simple cases
    m1 = new Map([[1, 1]]);
    m2 = new Map([[1, 1]]);
    m3 = new Map([[1, 3]]);
    assert.deepEqual(m1, m2, 'Single element maps [1,1] vs [1,1]');
    assert.notDeepEqual(m1, m3, 'Single element maps [1,1] vs [1,3]');

    // Mismatched sizes
    m1 = new Map([[1, 2]]);
    m2 = new Map([
      [3, 4],
      [5, 6],
    ]);
    assert.notDeepEqual(m1, m2, 'Compare maps with mismatch sizes');

    // Tricky values
    m1 = new Map([
      [false, false],
      [null, null],
      [0, 0],
      [undefined, undefined],
      [Infinity, Infinity],
      [NaN, NaN],
      [-Infinity, -Infinity],
    ]);
    m2 = new Map([
      [undefined, undefined],
      [null, null],
      [false, false],
      [0, 0],
      [NaN, NaN],
      [Infinity, Infinity],
      [-Infinity, -Infinity],
    ]);
    assert.deepEqual(m1, m2, 'Multiple-element maps of tricky values');

    // Same keys, different values
    m1 = new Map([
      [1, 'one'],
      [2, 'two'],
    ]);
    m2 = new Map([
      [1, 1],
      [2, 2],
    ]);
    assert.notDeepEqual(m1, m2, 'Maps with same keys, different values');

    // Maps Containing objects
    o1 = { foo: 0, bar: true };
    o2 = { foo: 0, bar: true };
    o3 = { foo: 1, bar: true };
    o4 = { foo: 1, bar: true };
    m1 = new Map([
      [1, o1],
      [2, o3],
    ]);
    m2 = new Map([
      [1, o1],
      [2, o3],
    ]);
    assert.deepEqual(m1, m2, 'Maps containing same objects');
    m1 = new Map([[1, o1]]);
    m2 = new Map([[1, o2]]);
    assert.deepEqual(m1, m2, 'Maps containing different but deeply-equal objects');
    m1 = new Map([
      [1, o1],
      [2, o3],
    ]);
    m2 = new Map([
      [2, o4],
      [1, o2],
    ]);
    assert.deepEqual(
      m1,
      m2,
      'Maps containing different but deeply-equal objects in different insertion order',
    );
    m1 = new Map([[o1, 1]]);
    m2 = new Map([[o2, 1]]);
    assert.deepEqual(m1, m2, 'Maps containing different but deeply-equal objects as keys');
    m1 = new Map([
      [o1, 1],
      [o3, 2],
    ]);
    m2 = new Map([
      [o4, 2],
      [o2, 1],
    ]);
    assert.deepEqual(
      m1,
      m2,
      'Maps containing different but deeply-equal objects as keys in different insertion order',
    );

    // Maps containing different objects
    m1 = new Map([[1, o1]]);
    m2 = new Map([[1, o3]]);
    assert.notDeepEqual(m1, m2, 'Maps containing different objects');

    // Maps containing maps
    m1 = new Map([[1, 1]]);
    m2 = new Map([[1, 1]]);
    m3 = new Map([['myMap', m1]]);
    m4 = new Map([['myMap', m2]]);
    assert.deepEqual(m3, m4, 'Maps containing deeply-equal maps');

    // Maps containing different maps
    m1 = new Map([[1, 1]]);
    m2 = new Map([[1, 2]]);
    m3 = new Map([['myMap', m1]]);
    m4 = new Map([['myMap', m2]]);
    assert.notDeepEqual(m3, m4, 'Maps containing different maps');

    // Maps containing sets
    s1 = new Set([1, 2, 3]);
    s2 = new Set([1, 2, 3]);
    s3 = new Set([1, 2, 3, 4]);
    m1 = new Map([[1, s1]]);
    m2 = new Map([[1, s2]]);
    assert.deepEqual(m1, m2, 'Maps containing different but deeply-equal sets');

    // Maps containing different sets
    m1 = new Map([[1, s1]]);
    m2 = new Map([[1, s3]]);
    assert.notDeepEqual(m1, m2, 'Maps containing different sets');
  });
});
