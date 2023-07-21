const hasOwn = Object.prototype.hasOwnProperty

function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

export function objectType(obj) {
  if (typeof obj === 'undefined') {
    return 'undefined';
  }

  // Consider: typeof null === object
  if (obj === null) {
    return 'null';
  }
  var match = toString.call(obj).match(/^\[object\s(.*)\]$/);
  var type = match && match[1];
  switch (type) {
    case 'Number':
      if (isNaN(obj)) {
        return 'nan';
      }
      return 'number';
    case 'String':
    case 'Boolean':
    case 'Array':
    case 'Set':
    case 'Map':
    case 'Date':
    case 'RegExp':
    case 'Function':
    case 'Symbol':
      return type.toLowerCase();
    default:
      return _typeof(obj);
  }
}

function is(type, obj) {
  return objectType(obj) === type;
}

export function objectValues(obj) {
  let allowArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  let vals = allowArray && is('array', obj) ? [] : {};

  for (var key in obj) {
    if (hasOwn.call(obj, key)) {
      let val = obj[key];
      vals[key] = val === Object(val) ? objectValues(val, allowArray) : val;
    }
  }

  return vals;
}

/**
 *
 * Recursively clone an object into a plain object, taking only the
 * subset of own enumerable properties that exist a given model.
 *
 * @param {any} obj
 * @param {any} model
 * @return {Object}
 */
export function objectValuesSubset(obj, model) {
  // Return primitive values unchanged to avoid false positives or confusing
  // results from assert.propContains().
  // E.g. an actual null or false wrongly equaling an empty object,
  // or an actual string being reported as object not matching a partial object.
  if (obj !== Object(obj)) {
    return obj;
  }

  // Unlike objectValues(), subset arrays to a plain objects as well.
  // This enables subsetting [20, 30] with {1: 30}.
  var subset = {};
  for (var key in model) {
    if (hasOwn.call(model, key) && hasOwn.call(obj, key)) {
      subset[key] = objectValuesSubset(obj[key], model[key]);
    }
  }
  return subset;
}

export function validateExpectedExceptionArgs(expected, message, assertionMethod) {
  var expectedType = objectType(expected);

  // 'expected' is optional unless doing string comparison
  if (expectedType === 'string') {
    if (message === undefined) {
      message = expected;
      expected = undefined;
      return [expected, message];
    } else {
      throw new Error('assert.' + assertionMethod + ' does not accept a string value for the expected argument.\n' + 'Use a non-string object value (e.g. RegExp or validator function) ' + 'instead if necessary.');
    }
  }
  var valid = !expected ||
  // TODO: be more explicit here
  expectedType === 'regexp' || expectedType === 'function' || expectedType === 'object';
  if (!valid) {
    throw new Error('Invalid expected value type (' + expectedType + ') ' + 'provided to assert.' + assertionMethod + '.');
  }
  return [expected, message];
}

export function validateException(actual, expected, message) {
  var result = false;
  var expectedType = objectType(expected);

  // These branches should be exhaustive, based on validation done in validateExpectedException

  // We don't want to validate
  if (!expected) {
    result = true;

    // Expected is a regexp
  } else if (expectedType === 'regexp') {
    result = expected.test(errorString(actual));

    // Log the string form of the regexp
    expected = String(expected);

    // Expected is a constructor, maybe an Error constructor.
    // Note the extra check on its prototype - this is an implicit
    // requirement of "instanceof", else it will throw a TypeError.
  } else if (expectedType === 'function' && expected.prototype !== undefined && actual instanceof expected) {
    result = true;

    // Expected is an Error object
  } else if (expectedType === 'object') {
    result = actual instanceof expected.constructor && actual.name === expected.name && actual.message === expected.message;

    // Log the string form of the Error object
    expected = errorString(expected);

    // Expected is a validation function which returns true if validation passed
  } else if (expectedType === 'function') {
    // protect against accidental semantics which could hard error in the test
    try {
      result = expected.call({}, actual) === true;
      expected = null;
    } catch (e) {
      // assign the "expected" to a nice error string to communicate the local failure to the user
      expected = errorString(e);
    }
  }
  return [result, expected, message];
}

function errorString(error) {
  // Use String() instead of toString() to handle non-object values like undefined or null.
  var resultErrorString = String(error);

  // If the error wasn't a subclass of Error but something like
  // an object literal with name and message properties...
  if (resultErrorString.slice(0, 7) === '[object') {
    // Based on https://es5.github.io/#x15.11.4.4
    return (error.name || 'Error') + (error.message ? ": ".concat(error.message) : '');
  } else {
    return resultErrorString;
  }
}

export default { objectValues, objectValuesSubset, validateExpectedExceptionArgs, validateException };
