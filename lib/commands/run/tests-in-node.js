import parseFsInputs from '../../utils/parse-fs-inputs.js';

export default async function runTestsInNode(fileOrFolderInputs, QUnit, config) {
  window.QUnit.config = Object.assign({}, window.oldQunitConfig);
  window.location = window.location;
  const fsTree = await parseFsInputs(fileOrFolderInputs, {}, async(targetPath, fsEntry) => {
    console.log('importing');
    await import(targetPath);
    fsEntry.executed = true;
  }, config);
  console.log('TAP version 13');

  // globalStartCalled = false;
  QUnit.start();
  console.log('called start');
}
