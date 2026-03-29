// Benchmarks for shared utility functions in shims/shared/index.js.
// These are called on every propEqual, propContains, throws, and rejects call.
//
// Run: deno bench --allow-read benches/utils.bench.js

import {
  objectType,
  objectValues,
  objectValuesSubset,
  validateException,
} from '../shims/shared/index.ts';

// --- objectType ---
// Called in validateExpectedExceptionArgs and validateException on every
// throws/rejects assertion, and internally in objectValues.

Deno.bench('objectType - number', () => {
  objectType(42);
});

Deno.bench('objectType - string', () => {
  objectType('hello');
});

Deno.bench('objectType - null', () => {
  objectType(null);
});

Deno.bench('objectType - plain object', () => {
  objectType({});
});

Deno.bench('objectType - array', () => {
  objectType([]);
});

Deno.bench('objectType - Date', () => {
  objectType(new Date());
});

Deno.bench('objectType - RegExp', () => {
  objectType(/foo/);
});

// --- objectValues ---
// Called on every propEqual / propContains invocation to clone own props.

const flatObj = { a: 1, b: 2, c: 3 };
Deno.bench('objectValues - flat object (3 keys)', () => {
  objectValues(flatObj);
});

const nestedObj = { a: { b: 1, c: { d: 2 } }, e: 3 };
Deno.bench('objectValues - nested object', () => {
  objectValues(nestedObj);
});

const arrayObj = [1, 2, 3, 4, 5];
Deno.bench('objectValues - array (5 items)', () => {
  objectValues(arrayObj);
});

// --- objectValuesSubset ---
// Called on every propContains / notPropContains.

const fullObj = { a: 1, b: 2, c: 3, d: 4 };
const model = { a: 1, b: 2 };
Deno.bench('objectValuesSubset - 2 of 4 keys', () => {
  objectValuesSubset(fullObj, model);
});

// --- validateException ---
// Called on every throws / rejects assertion after the error is caught.

const err = new TypeError('bad value');

Deno.bench('validateException - no expected (always passes)', () => {
  validateException(err, undefined, 'message');
});

Deno.bench('validateException - regexp match', () => {
  validateException(err, /bad value/, 'message');
});

Deno.bench('validateException - constructor (instanceof)', () => {
  validateException(err, TypeError, 'message');
});

Deno.bench('validateException - function validator', () => {
  validateException(err, (e) => e instanceof TypeError, 'message');
});
