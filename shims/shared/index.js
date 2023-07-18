/**
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
    if (hasOwn$1.call(model, key) && hasOwn$1.call(obj, key)) {
      subset[key] = objectValuesSubset(obj[key], model[key]);
    }
  }
  return subset;
}

export default { objectValuesSubset };
