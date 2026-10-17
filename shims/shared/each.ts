// QUnit's runEach() and makeEachTestName(), ported, so `test.each()` names each case
// the same on Node.js and Deno as QUnit names it in the browser: by the value itself
// where that is short and readable (`add [foo]`), by its index otherwise (`add [0]`,
// `add [1: 42]`), and by key for an object dataset.

// Characters that make a test name hard to read in a terminal: control characters,
// DEL, and the non-breaking space. A name with one gets the index alone, as in QUnit.
// deno-lint-ignore no-control-regex
const NON_OBVIOUS = /[\x00-\x1F\x7F\xA0]/;
// NON_OBVIOUS, or what looks like the `index: value` names this gives (`3: foo`), so
// a string can never be named like another case. One scan for the common short string.
// deno-lint-ignore no-control-regex
const NOT_ITS_OWN_NAME = /[\x00-\x1F\x7F\xA0]|\d+: /;

/** The name of one `test.each()` case: `name [key]`. */
export function printTestNameWithEach(testName: string, key: string | number): string {
  return `${testName} [${key}]`;
}

/** Calls `eachFn(value, key)` for every case in a `test.each()` dataset. */
export function runEach(data: unknown, eachFn: (value: unknown, key: string | number) => void): void {
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      let key: string | number = i;
      if (typeof value === 'string') {
        if (value.length <= 40 && !NOT_ITS_OWN_NAME.test(value)) key = value;
        else if (!NON_OBVIOUS.test(value)) key = `${i}: ${value.length <= 30 ? value : value.slice(0, 29) + '…'}`;
      } else if (value == null || typeof value === 'number' || typeof value === 'boolean') {
        // At most 24 characters (`-1.7976931348623157e+308`), so never cut short.
        key = `${i}: ${value}`;
      }
      eachFn(value, key);
    }
  } else if (typeof data === 'object' && data !== null) {
    for (const key in data) {
      eachFn((data as Record<string, unknown>)[key], key);
    }
  } else {
    throw new TypeError(`test.each() expects an array or object as input, but\nfound ${typeof data} instead.`);
  }
}
