import clonedeep from 'lodash.clonedeep';
import parseFsInputs from '../../utils/parse-fs-inputs.js';

export default async function runTestsInNode(fileOrFolderInputs, config) {
  global.testTimeout = config.timeout;

  // window.QUnit.config.autostart = false;
  let oldQUnitConfig = clonedeep(window.QUnit.config);

  window.QUnit.stop();
  let resolvePromise;
  let promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
  });
  window.QUnit.done(() => resolvePromise());

  const fsTree = await parseFsInputs(fileOrFolderInputs, {}, async(targetPath, fsEntry) => {
    console.log('importing');
    await import(targetPath);
    console.log('imported');

    fsEntry.executed = true;
  }, config);
  console.log('TAP version 13');

  console.log('before start');
  setTimeout(() => {
    window.QUnit.stop();
    window.QUnit.start()
  }, 1000);
  console.log('after start');

  await promise;
  window.QUnit.config = oldQUnitConfig;
  // window.QUnit.config.autostart = false;
  // window.QUnit.config.queue.length = 0;

  console.log(window.QUnit.config);
}
