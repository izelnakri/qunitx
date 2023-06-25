import {
  afterEach,
  beforeEach,
  beforeAll,
  afterAll,
  describe,
  it,
} from "https://deno.land/std@0.192.0/testing/bdd.ts";
import assert from './deno-assert.js';

// TODO: TEST beforeEach, before, afterEach, after, currently not sure if they work!
export const module = async function(moduleName, runtimeOptions, moduleContent) {
  let targetRuntimeOptions = moduleContent ? Object.assign(runtimeOptions, { name: moduleName }) : { name: moduleName };
  let targetModuleContent = moduleContent ? moduleName : runtimeOptions;

  return describe(assignDefaultValues(targetRuntimeOptions, { concurrency: true }), async function() {
    return await targetModuleContent({ before: beforeAll, after: afterAll, beforeEach, afterEach }, {
      moduleName,
      options: runtimeOptions
    });
  });
}

export const test = async function(testName, runtimeOptions, testContent) {
  let targetRuntimeOptions = testContent ? Object.assign(runtimeOptions, { name: testName }) : { name: testName };
  let targetTestContent = testContent ? testContent : runtimeOptions;

  return it(targetRuntimeOptions, async function() {
    let metadata = { testName, options: targetRuntimeOptions, expectedTestCount: undefined };
    return await targetTestContent(assert, metadata);

    if (expectedTestCount) {

    }
  });
}

function assignDefaultValues(options, defaultValues) {
  for (let key in defaultValues) {
    if (options[key] === undefined) {
      options[key] = defaultValues[key];
    }
  }

  return options;
}
