import fs from 'fs/promises';
import kleur from 'kleur';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';
import parseFsInputs from '../../utils/parse-fs-inputs.js';
import timeCounter from '../../utils/time-counter.js';
import TAPDisplayFinalResult from '../../tap/display-final-result.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

class BundleError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BundleError';
    this.message = `esbuild Bundle Error: ${message}`.split('\n').join('\n# ');
  }
}

export default async function runTestsInBrowser(
  fileOrFolderInputs,
  config,
  cachedContent = {},
  connections
) {
  config.COUNTER = { testCount: 0, failCount: 0, skipCount: 0, passCount: 0 };

  const { projectRoot, timeout, output } = config;
  const fsTree = await parseFsInputs(fileOrFolderInputs, {}, async(targetPath, fsEntry) => {
    fsEntry.executed = false;
  }, config);

  try {
    await esbuild.build({
      stdin: {
        contents: Object.keys(fsTree).reduce((result, fileAbsolutePath) => {
          return result + `import "${fileAbsolutePath}";`
        }, ''),
        resolveDir: process.cwd()
      },
      bundle: true,
      logLevel: 'error',
      outfile: `${projectRoot}/${output}/tests.js`
    }); // NOTE: This prevents file cache most likely
    cachedContent.allTestCode = await fs.readFile(`${projectRoot}/${output}/tests.js`);

    let TIME_COUNTER = timeCounter();

    await Promise.all(cachedContent.htmlPathsToRunTests.map((htmlPath) => {
      return runTestInsideHTMLFile(htmlPath, connections, config); // NOTE: maybe make this blocking
    }));

    let TIME_TAKEN = TIME_COUNTER.stop()

    TAPDisplayFinalResult(config.COUNTER, TIME_TAKEN);

    if (!config.watch) {
      await Promise.all([
        connections.server && connections.server.close(),
        connections.browser && connections.browser.close()
      ]);

      return process.exit(config.COUNTER.failCount > 0 ? 1 : 0);
    }
  } catch(error) {
    console.log(error);
    let exception = new BundleError(error);

    if (config.watch) {
      console.log(`# ${exception}`);
    } else {
      throw exception;
    }
  }

  return connections;
}

async function runTestInsideHTMLFile(filePath, { page, server }, config) {
  let QUNIT_RESULT;
  try {
    console.log('#', kleur.blue(`QUnitX running: http://localhost:${server.config.port}${filePath}`));
    await page.goto(`http://localhost:${server.config.port}${filePath}`, { timeout: 0 });
    await page.evaluate(() => {
      window.IS_PUPPETEER = true;
    });
    await page.waitForFunction(`window.testTimeout >= ${config.timeout}`, { timeout: 0 });

    QUNIT_RESULT = await page.evaluate(() => window.QUNIT_RESULT);
  } catch(error) {
    console.log(error);
    console.error(error);
  }

  if (!QUNIT_RESULT || QUNIT_RESULT.totalTests === 0) {
    console.log('BROWSER: runtime error thrown during executing tests');
    console.error('BROWSER: runtime error thrown during executing tests');

    await failOnNonWatchMode(config.watch);
  } else if (QUNIT_RESULT.totalTests > QUNIT_RESULT.finishedTests) {
    console.log(`BROWSER: TEST TIMED OUT: ${QUNIT_RESULT.currentTest}`);
    console.error(`BROWSER: TEST TIMED OUT: ${QUNIT_RESULT.currentTest}`);

    await failOnNonWatchMode(config.watch);
  }
}

async function failOnNonWatchMode(watchMode = false) {
  if (!watchMode) {
    await new Promise((resolve, reject) => setTimeout(() => resolve(process.exit(1)), 100));
  }
}
