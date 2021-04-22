import parseFsInputs from '../../utils/parse-fs-inputs.js';

let count = 0;

export default async function runTestsInNode(fileOrFolderInputs, config) {
  config.COUNTER = { testCount: 0, failCount: 0, skipCount: 0, passCount: 0 };
  global.testTimeout = config.timeout;

  window.QUnit.reset();

  const fsTree = await parseFsInputs(fileOrFolderInputs, {}, async (targetPath, fsEntry) => {
    count = count + 1;

    try {
      await import(`${targetPath}?${count}`);

      let waitForTestCompletion = setupTestWaiting();

      console.log('TAP version 13');
      window.QUnit.start();

      await waitForTestCompletion;
    } catch(error) {
      let exception = new ImportError(targetPath, error);

      if (config.watch) {
        console.log(`# ${exception}`);
      } else {
        throw exception;
      }
    }

    fsEntry.executed = true;
  }, config);
}

function setupTestWaiting() {
  let finalizeTestCompletion;
  let promise = new Promise((resolve, reject) => finalizeTestCompletion = resolve);

  window.QUnit.done(() => finalizeTestCompletion());

  return promise;
}

class ImportError extends Error {
  constructor(path, message) {
    super(message);
    this.name = 'ImportError';
    this.targetFile = path;
    this.message = `File: ${path} | ${message}`.split('\n').join('\n# ');
  }
}
