const hasOwn = Object.prototype.hasOwnProperty;
const objToString = Object.prototype.toString;

export function objectType(obj: unknown): string {
  if (obj === null) return 'null';
  const t = typeof obj;
  // Fast path: primitives + functions return their `typeof` directly. Skips
  // the Object.prototype.toString.call() detour that allocates a "[object Foo]"
  // string for every primitive check.
  switch (t) {
    case 'undefined':
    case 'string':
    case 'boolean':
    case 'function':
    case 'symbol':
    case 'bigint':
      return t;
    case 'number':
      // x !== x is true only for NaN.
      return obj !== obj ? 'nan' : 'number';
  }
  // typeof === 'object': fall through to qunit.js's exact slow path so
  // boxed primitives, cross-realm objects, and Symbol.toStringTag overrides
  // produce the same classification as the upstream library.
  const type = objToString.call(obj).slice(8, -1);
  switch (type) {
    case 'Number':
      return isNaN(obj as number) ? 'nan' : 'number';
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
      return 'object';
  }
}

export function objectValues(obj: unknown, allowArray = true): unknown {
  const vals: Record<string, unknown> | unknown[] = allowArray && Array.isArray(obj) ? [] : {};

  for (const key in obj as object) {
    if (hasOwn.call(obj, key)) {
      const val = (obj as Record<string, unknown>)[key];
      // `val === Object(val)` returns true for objects+functions and false for
      // primitives/null — but it boxes every primitive into a wrapper object
      // just to throw it away. The typeof check is the same boolean without
      // the per-call allocation.
      const t = typeof val;
      const isObjectish = val !== null && (t === 'object' || t === 'function');
      (vals as Record<string, unknown>)[key] = isObjectish ? objectValues(val, allowArray) : val;
    }
  }

  return vals;
}

/**
 * Recursively clone an object into a plain object, taking only the
 * subset of own enumerable properties that exist in a given model.
 */
export function objectValuesSubset(obj: unknown, model: unknown): unknown {
  // Return primitive values unchanged to avoid false positives or confusing
  // results from assert.propContains().
  // E.g. an actual null or false wrongly equaling an empty object,
  // or an actual string being reported as object not matching a partial object.
  // `obj !== Object(obj)` boxes primitives into wrapper objects every call —
  // typeof matches the same set without allocating.
  if (obj === null) return obj;
  const objT = typeof obj;
  if (objT !== 'object' && objT !== 'function') return obj;

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
      throw new Error(
        `assert.${assertionMethod} does not accept a string value for the expected argument.\n` +
        'Use a non-string object value (e.g. RegExp or validator function) instead if necessary.',
      );
    }
  }
  const valid = !expected || expectedType === 'regexp' || expectedType === 'function' || expectedType === 'object';
  if (!valid) {
    throw new Error(`Invalid expected value type (${expectedType}) provided to assert.${assertionMethod}.`);
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
    const name = (error as { name?: string }).name || 'Error';
    const msg = (error as { message?: string }).message;
    return msg ? `${name}: ${msg}` : name;
  }

  return resultErrorString;
}
