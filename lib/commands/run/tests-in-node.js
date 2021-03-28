import parseFsInputs from '../../utils/parse-fs-inputs.js';

export default async function runTestsInNode(fileOrFolderInputs, config) {
  global.testTimeout = config.timeout;

  const QUnit = (await import('../../setup/node-js-environment.js')).default;
  const fsTree = await parseFsInputs(fileOrFolderInputs, {}, async(targetPath, fsEntry) => {
    await import(targetPath);
    fsEntry.executed = true;
  }, config);
  console.log('TAP version 13');

  return QUnit.start();
}
