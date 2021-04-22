import parseFsInputs from '../../utils/parse-fs-inputs.js';

let count = 0;

export default async function runTestsInNode(fileOrFolderInputs, config) {
  config.COUNTER = { testCount: 0, failCount: 0, skipCount: 0, passCount: 0 };

  global.testTimeout = config.timeout;

  let waitForTestCompletion = setupTestWaiting();

  window.QUnit.reset();

  const fsTree = await parseFsInputs(fileOrFolderInputs, {}, async (targetPath, fsEntry) => {
    count = count + 1;

    await import(`${targetPath}?${count}`);

    fsEntry.executed = true;
  }, config);

  console.log('TAP version 13');
  window.QUnit.start();

  await waitForTestCompletion;
}

function setupTestWaiting() {
  let finalizeTestCompletion;
  let promise = new Promise((resolve, reject) => finalizeTestCompletion = resolve);

  window.QUnit.done(() => finalizeTestCompletion());

  return promise;
}
