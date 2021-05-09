import kleur from 'kleur';

let count = 0;

export default async function runTestsInNode(fileAbsolutePaths, config) {
  config.COUNTER = { testCount: 0, failCount: 0, skipCount: 0, passCount: 0 };
  global.testTimeout = config.timeout;

  window.QUnit.reset();

  try {
    let waitForTestCompletion = setupTestWaiting();

    console.log('#', kleur.blue(`QUnitX running: ${fileAbsolutePaths.join(', ')}`));
    await Promise.all(fileAbsolutePaths.map(async (fileAbsolutePath) => {
      count = count + 1;

      try {
        config.lastRanTestFiles = [fileAbsolutePath];

        await import(`${fileAbsolutePath}?${count}`);
      } catch(error) {
        let exception = new ImportError(fileAbsolutePath, error);

        if (config.watch) {
          config.lastFailedTestFiles = [fileAbsolutePath];
          console.log(`# ${exception}`);
        } else {
          throw exception;
        }
      }
    }));

    console.log('TAP version 13');

    window.QUnit.start();

    await waitForTestCompletion;
  } catch (error) {
  }
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
