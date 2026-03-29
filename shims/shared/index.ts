const hasOwn = Object.prototype.hasOwnProperty

export function objectType(obj: unknown): string {
  if (typeof obj === 'undefined') {
    return 'undefined';
  }

  // Consider: typeof null === object
  if (obj === null) {
    return 'null';
  }
  // slice(8, -1) extracts the type name from "[object Foo]" without a regex
  const type = Object.prototype.toString.call(obj).slice(8, -1);
  switch (type) {
    case 'Number':
      if (isNaN(obj as number)) {
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
      return typeof obj;
  }
}

function is(type: string, obj: unknown): boolean {
  return objectType(obj) === type;
}

export function objectValues(obj: unknown, allowArray = true): unknown {
  const vals: Record<string, unknown> | unknown[] = allowArray && is('array', obj) ? [] : {};

  for (const key in obj as object) {
    if (hasOwn.call(obj, key)) {
      const val = (obj as Record<string, unknown>)[key];
      (vals as Record<string, unknown>)[key] = val === Object(val) ? objectValues(val, allowArray) : val;
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
export function objectValuesSubset(obj: unknown, model: unknown): unknown {
  // Return primitive values unchanged to avoid false positives or confusing
  // results from assert.propContains().
  // E.g. an actual null or false wrongly equaling an empty object,
  // or an actual string being reported as object not matching a partial object.
  if (obj !== Object(obj)) {
    return obj;
  }

  // Unlike objectValues(), subset arrays to a plain objects as well.
  // This enables subsetting [20, 30] with {1: 30}.
  const subset: Record<string, unknown> = {};
  for (const key in model as object) {
    if (hasOwn.call(model, key) && hasOwn.call(obj, key)) {
      subset[key] = objectValuesSubset(
        (obj as Record<string, unknown>)[key],
        (model as Record<string, unknown>)[key],
      );
    }
  }
  return subset;
}

export function validateExpectedExceptionArgs(
  expected: unknown,
  message: string | undefined,
  assertionMethod: string,
): [unknown, string | undefined] {
  const expectedType = objectType(expected);

  // 'expected' is optional unless doing string comparison
  if (expectedType === 'string') {
    if (message === undefined) {
      message = expected as string;
      expected = undefined;
      return [expected, message];
    } else {
      throw new Error('assert.' + assertionMethod + ' does not accept a string value for the expected argument.\n' + 'Use a non-string object value (e.g. RegExp or validator function) ' + 'instead if necessary.');
    }
  }
  const valid = !expected ||
  // TODO: be more explicit here
  expectedType === 'regexp' || expectedType === 'function' || expectedType === 'object';
  if (!valid) {
    throw new Error('Invalid expected value type (' + expectedType + ') ' + 'provided to assert.' + assertionMethod + '.');
  }
  return [expected, message];
}

export function validateException(
  actual: unknown,
  expected: unknown,
  message: string | undefined,
): [boolean, unknown, string | undefined] {
  let result = false;
  const expectedType = objectType(expected);

  // These branches should be exhaustive, based on validation done in validateExpectedException

  // We don't want to validate
  if (!expected) {
    result = true;

    // Expected is a regexp
  } else if (expectedType === 'regexp') {
    result = (expected as RegExp).test(errorString(actual));

    // Log the string form of the regexp
    expected = String(expected);

    // Expected is a constructor, maybe an Error constructor.
    // Note the extra check on its prototype - this is an implicit
    // requirement of "instanceof", else it will throw a TypeError.
  } else if (
    expectedType === 'function' &&
    (expected as { prototype: unknown }).prototype !== undefined &&
    actual instanceof (expected as new (...args: unknown[]) => unknown)
  ) {
    result = true;

    // Expected is an Error object
  } else if (expectedType === 'object') {
    result =
      actual instanceof (expected as { constructor: new (...args: unknown[]) => unknown }).constructor &&
      (actual as Error).name === (expected as Error).name &&
      (actual as Error).message === (expected as Error).message;

    // Log the string form of the Error object
    expected = errorString(expected);

    // Expected is a validation function which returns true if validation passed
  } else if (expectedType === 'function') {
    // protect against accidental semantics which could hard error in the test
    try {
      result = (expected as (e: unknown) => boolean).call({}, actual) === true;
      expected = null;
    } catch (e) {
      // assign the "expected" to a nice error string to communicate the local failure to the user
      expected = errorString(e);
    }
  }
  return [result, expected, message];
}

function errorString(error: unknown): string {
  // Use String() instead of toString() to handle non-object values like undefined or null.
  const resultErrorString = String(error);

  // If the error wasn't a subclass of Error but something like
  // an object literal with name and message properties...
  if (resultErrorString.slice(0, 7) === '[object') {
    // Based on https://es5.github.io/#x15.11.4.4
    return (
      ((error as { name?: string }).name || 'Error') +
      ((error as { message?: string }).message
        ? ': '.concat((error as { message: string }).message)
        : '')
    );
  } else {
    return resultErrorString;
  }
}

export default { objectValues, objectValuesSubset, validateExpectedExceptionArgs, validateException };
