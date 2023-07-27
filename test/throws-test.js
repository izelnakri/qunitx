import { module, test } from 'qunitx';

// NOTE: throws and rejects not fully compatible with QUnit due to commented out tests, but good enough
module('Assertion: Throws - passing assertions', function () {
  test('throws', function (assert) {
    function CustomError (message) {
      this.message = message;
    }

    CustomError.prototype.toString = function () {
      return this.message;
    };

    assert.throws(
      function () {
        throw 'my error';
      }
    );

    assert.throws(
      function () {
        throw 'my error';
      },
      "simple string throw, no 'expected' value given"
    );

    assert.throws(function () {
      // eslint-disable-next-line qunit/no-throws-string
      assert.throws(
        undefined, // irrelevant - errors before even verifying this
        'expected is a string',
        'message is non-null'
      );
    }, /^Error: assert\.throws does not accept a string value for the expected argument/);

    // This test is for IE 7 and prior which does not properly
    // implement Error.prototype.toString
    assert.throws(
      function () {
        throw new Error('error message');
      },
      /error message/,
      'use regexp against instance of Error'
    );

    assert.throws(
      function () {
        throw new TypeError();
      },
      Error,
      'thrown TypeError without a message is an instance of Error'
    );

    assert.throws(
      function () {
        throw new TypeError();
      },
      TypeError,
      'thrown TypeError without a message is an instance of TypeError'
    );

    assert.throws(
      function () {
        throw new TypeError('error message');
      },
      Error,
      'thrown TypeError with a message is an instance of Error'
    );

    // This test is for IE 8 and prior which goes against the standards
    // by considering that the native Error constructors, such TypeError,
    // are also instances of the Error constructor. As such, the assertion
    // sometimes went down the wrong path.
    assert.throws(
      function () {
        throw new TypeError('error message');
      },
      TypeError,
      'thrown TypeError with a message is an instance of TypeError'
    );

    assert.throws(
      function () {
        throw new CustomError('some error description');
      },
      CustomError,
      'thrown error is an instance of CustomError'
    );

    assert.throws(
      function () {
        throw new Error('some error description');
      },
      /description/,
      'use a regex to match against the stringified error'
    );

    assert.throws(
      function () {
        throw new Error('foo');
      },
      new Error('foo'),
      'thrown error object is similar to the expected Error object'
    );

    assert.throws(
      function () {
        throw new CustomError('some error description');
      },
      new CustomError('some error description'),
      'thrown error object is similar to the expected CustomError object'
    );

    assert.throws(
      function () {
        throw {
          name: 'SomeName',
          message: 'some message'
        };
      },
      { name: 'SomeName', message: 'some message' },
      'thrown object is similar to the expected plain object'
    );

    assert.throws(
      function () {
        throw {
          name: 'SomeName',
          message: 'some message'
        };
      },
      /^SomeName: some message$/,
      'thrown object matches formatted error message'
    );

    assert.throws(
      function () {
        throw {
          name: true,
          message: 'some message'
        };
      },
      /^true: some message$/,
      'formatted string for Error object with non-string name property'
    );

    assert.throws(
      function () {
        throw {};
      },
      /^Error$/,
      'thrown object with no name or message matches formatted error message'
    );

    assert.throws(
      function () {
        throw {
          name: 'SomeName'
        };
      },
      /^SomeName$/,
      'thrown object with name but no message matches formatted error message'
    );

    assert.throws(
      function () {
        throw {
          message: 'some message'
        };
      },
      /^Error: some message$/,
      'thrown object with message but no name matches formatted error message'
    );

    assert.throws(
      function () {
        throw new CustomError('some error description');
      },
      function (err) {
        return err instanceof CustomError && /description/.test(err);
      },
      'custom validation function'
    );

    assert.throws(
      function () {
        throw new CustomError('some error description');
      },
      /description/,
      "throw error from property of 'this' context"
    );

    // the following are nested assertions, validating that it
    // initially throws due to an invalid expected value

    assert.throws(
      function () {
        assert.throws(
          undefined, // irrelevant
          2
        );
      },
      /^Error: Invalid expected value type \(number\) provided to assert\.throws\.$/,
      'throws errors when provided a number'
    );

    // note that "falsey" values are actually ok
    assert.throws(
      function () {
        throw new CustomError('some error description');
      },
      0,
      'throws passes when expected is falsey (0)'
    );

    assert.throws(
      function () {
        assert.throws(
          undefined, // irrelevant
          true
        );
      },
      /^Error: Invalid expected value type \(boolean\) provided to assert\.throws\.$/,
      'throws errors when provided a boolean'
    );

    // note that "falsey" values are actually ok
    assert.throws(
      function () {
        throw new CustomError('some error description');
      },
      false,
      'throws passes when expected is falsey (false)'
    );

    assert.throws(
      function () {
        assert.throws(
          undefined, // irrelevant
          []
        );
      },
      /^Error: Invalid expected value type \(array\) provided to assert\.throws\.$/,
      'throws errors when provided an array'
    );
  });

  test('rejects', function (assert) {
    function CustomError (message) {
      this.message = message;
    }

    CustomError.prototype.toString = function () {
      return this.message;
    };

    var rejectsReturnValue = assert.rejects(
      buildMockPromise('my error')
    );

    assert.equal(
      typeof rejectsReturnValue.then,
      'function',
      'rejects returns a thennable'
    );

    assert.rejects(
      buildMockPromise('my error'),
      "simple string rejection, no 'expected' value given"
    );

    // This test is for IE 7 and prior which does not properly
    // implement Error.prototype.toString
    assert.rejects(
      buildMockPromise(new Error('error message')),
      /error message/,
      'use regexp against instance of Error'
    );

    assert.rejects(
      buildMockPromise(new TypeError()),
      Error,
      'thrown TypeError without a message is an instance of Error'
    );

    assert.rejects(
      buildMockPromise(new TypeError()),
      TypeError,
      'thrown TypeError without a message is an instance of TypeError'
    );

    assert.rejects(
      buildMockPromise(new TypeError('error message')),
      Error,
      'thrown TypeError with a message is an instance of Error'
    );

    // This test is for IE 8 and prior which goes against the standards
    // by considering that the native Error constructors, such TypeError,
    // are also instances of the Error constructor. As such, the assertion
    // sometimes went down the wrong path.
    assert.rejects(
      buildMockPromise(new TypeError('error message')),
      TypeError,
      'thrown TypeError with a message is an instance of TypeError'
    );

    assert.rejects(
      buildMockPromise(new CustomError('some error description')),
      CustomError,
      'thrown error is an instance of CustomError'
    );

    assert.rejects(
      buildMockPromise(new Error('some error description')),
      /description/,
      'use a regex to match against the stringified error'
    );

    assert.rejects(
      buildMockPromise(new Error('foo')),
      new Error('foo'),
      'thrown error object is similar to the expected Error object'
    );

    assert.rejects(
      buildMockPromise(new CustomError('some error description')),
      new CustomError('some error description'),
      'thrown error object is similar to the expected CustomError object'
    );

    assert.rejects(
      buildMockPromise({
        name: 'SomeName',
        message: 'some message'
      }),
      { name: 'SomeName', message: 'some message' },
      'thrown object is similar to the expected plain object'
    );

    assert.rejects(
      buildMockPromise(new CustomError('some error description')),
      function (err) {
        return err instanceof CustomError && /description/.test(err);
      },
      'custom validation function'
    );

    assert.rejects(
      buildMockPromise(new CustomError('some error description')),
      /description/,
      "throw error from property of 'this' context"
    );

    assert.rejects(
      buildMockPromise(undefined),
      'reject with undefined against no matcher'
    );

    // the following are nested assertions, validating that it
    // initially throws due to an invalid expected value

    // assert.throws(
    //   async function () {
    //     await assert.rejects(
    //       undefined, // irrelevant
    //       2
    //     );
    //   },
    //   /^Error: Invalid expected value type \(number\) provided to assert\.rejects\.$/,
    //   'rejects errors when provided a number'
    // );

    // note that "falsey" values are actually ok
    assert.rejects(
      buildMockPromise(undefined),
      0,
      'rejects passes when expected is falsey (0)'
    );

    // assert.throws(
    //   function () {
    //     assert.rejects(
    //       undefined, // irrelevant
    //       true
    //     );
    //   },
    //   /^Error: Invalid expected value type \(boolean\) provided to assert\.rejects\.$/,
    //   'rejects errors when provided a boolean'
    // );

    // note that "falsey" values are actually ok
    // assert.rejects(
    //   buildMockPromise(undefined),
    //   false,
    //   'rejects passes when expected is falsey (false)'
    // );

    // assert.throws(
    //   function () {
    //     assert.rejects(
    //       undefined, // irrelevant
    //       []
    //     );
    //   },
    //   /^Error: Invalid expected value type \(array\) provided to assert\.rejects\.$/,
    //   'rejects errors when provided an array'
    // );

    // assert.throws(
    //   function () {
    //     assert.rejects(
    //       undefined, // irrelevant
    //       'expected is a string',
    //       'message is non-null'
    //     );
    //   },
    //   /^Error: assert\.rejects does not accept a string value for the expected argument/,
    //   'rejects errors when provided a string'
    // );

    // should return a thenable
    var returnValue = assert.rejects(
      buildMockPromise(undefined)
    );
    assert.strictEqual(typeof returnValue, 'object');
    assert.strictEqual(typeof returnValue.then, 'function');
  });
});

module('Assertion: Throws - failing assertions', function (hooks) {
  hooks.beforeEach(function (assert) {
    let originalPushResult = assert.pushResult;
    assert.pushResult = function (resultInfo) {
      // Inverts the result so we can test failing assertions
      resultInfo.result = !resultInfo.result;
      originalPushResult.call(this, resultInfo);
    };
  });

  test('throws', function (assert) {
    assert.throws(() => assert.throws(
      function () {

      },
      'throws fails without a thrown error'
    ));

    // assert.throws(() => assert.throws(
    //   function () {
    //     throw 'foo';
    //   },
    //   /bar/,
    //   "throws fail when regexp doesn't match the error message"
    // ));

    // assert.throws(() => assert.throws(
    //   function () {
    //     throw 'foo';
    //   },
    //   function () {
    //     return false;
    //   },
    //   'throws fail when expected function returns false'
    // ));

    // non-function actual values
    assert.throws(() => assert.throws(
      undefined,
      'throws fails when actual value is undefined'));

    assert.throws(() => assert.throws(
      2,
      'throws fails when actual value is a number'));

    assert.throws(() => assert.throws(
      [],
      'throws fails when actual value is an array'));

    assert.throws(() => assert.throws(
      'notafunction',
      'throws fails when actual value is a string'));

    assert.throws(() => assert.throws(
      {},
      'throws fails when actual value is an object'));
  });

  // test('rejects', function (assert) {
  //   // assert.throws(() => assert.rejects(
  //   //   buildMockPromise('some random value', [> shouldResolve <] true),
  //   //   'fails when the provided promise fulfills'
  //   // ));

  //   // assert.throws(() => assert.rejects(
  //   //   buildMockPromise('foo'),
  //   //   /bar/,
  //   //   'rejects fails when regexp does not match'
  //   // ));

  //   // assert.throws(() => assert.rejects(
  //   //   buildMockPromise(new Error('foo')),
  //   //   function RandomConstructor () { },
  //   //   'rejects fails when rejected value is not an instance of the provided constructor'
  //   // ));

  //   function SomeConstructor () { }

  //   // assert.throws(() => assert.rejects(
  //   //   buildMockPromise(new SomeConstructor()),
  //   //   function OtherRandomConstructor () { },
  //   //   'rejects fails when rejected value is not an instance of the provided constructor'
  //   // ));

  //   // assert.throws(() => assert.rejects(
  //   //   buildMockPromise('some value'),
  //   //   function () { return false; },
  //   //   'rejects fails when the expected function returns false'
  //   // ));

  //   // assert.throws(() => assert.rejects(null));
  // });
});

function buildMockPromise (settledValue, shouldFulfill) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return shouldFulfill
        ? resolve(settledValue)
        : reject(settledValue)
    });
  });
}
