import { dirname } from 'path';
import { fileURLToPath } from 'url';
import parseFsInputs from '../../utils/parse-fs-inputs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function runTestsInNode(fileOrFolderInputs, config) {
  global.testTimeout = config.timeout;

  let finalizeTestCompletion;
  let waitForTestCompletion = new Promise((resolve, reject) => finalizeTestCompletion = resolve);
  window.QUnit.done(() => finalizeTestCompletion());

  const fsTree = await parseFsInputs(fileOrFolderInputs, {}, async(targetPath, fsEntry) => {
    await import(targetPath);

    fsEntry.executed = true;
  }, config);
  console.log('TAP version 13');

  window.QUnit.start()

  await waitForTestCompletion;
}


