import fs from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import kleur from 'kleur';
import esbuild from 'esbuild';
import timeCounter from '../../utils/time-counter.js';
import runUserModule from '../../utils/run-user-module.js';
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
  config,
  cachedContent = {},
  connections,
  targetTestFilesToFilter
) {
  const { projectRoot, timeout, output } = config;
  const allTestFilePaths = Object.keys(config.fsTree);
  const runHasFilter = !!targetTestFilesToFilter;

  config.COUNTER = { testCount: 0, failCount: 0, skipCount: 0, passCount: 0 };
  config.lastRanTestFiles = targetTestFilesToFilter || allTestFilePaths;

  try {
    await Promise.all([
      esbuild.build({
        stdin: {
          contents: allTestFilePaths.reduce((result, fileAbsolutePath) => {
            return result + `import "${fileAbsolutePath}";`
          }, ''),
          resolveDir: process.cwd()
        },
        bundle: true,
        logLevel: 'error',
        outfile: `${projectRoot}/${output}/tests.js`,
        keepNames: true
      }), // NOTE: This prevents file cache most likely
      Promise.all(cachedContent.htmlPathsToRunTests.map(async (htmlPath) => {
        let targetPath = `${config.projectRoot}/${config.output}${htmlPath}`;

        if (htmlPath !== '/') {
          await fs.rm(targetPath, { force: true, recursive: true });
          await fs.mkdir(targetPath.split('/').slice(0, -1).join('/'), { recursive: true }); // NOTE: this can be done earlier
        }
      }))
    ]);
    cachedContent.allTestCode = await fs.readFile(`${projectRoot}/${output}/tests.js`);

    if (runHasFilter) {
      let outputPath = `${projectRoot}/${output}/filtered-tests.js`;

      await buildFilteredTests(targetTestFilesToFilter, outputPath);
      cachedContent.filteredTestCode = (await fs.readFile(outputPath)).toString();
    }

    let TIME_COUNTER = timeCounter();

    if (runHasFilter) {
      await runTestInsideHTMLFile('/qunitx.html', connections, config);
    } else {
      await Promise.all(cachedContent.htmlPathsToRunTests.map((htmlPath) => {
        return runTestInsideHTMLFile(htmlPath, connections, config); // NOTE: maybe make this blocking
      }));
    }

    let TIME_TAKEN = TIME_COUNTER.stop()

    TAPDisplayFinalResult(config.COUNTER, TIME_TAKEN);

    if (config.after) {
      await runUserModule(`${process.cwd()}/${config.after}`, config.COUNTER, 'after');
    }

    if (!config.watch) {
      await Promise.all([
        connections.server && connections.server.close(),
        connections.browser && connections.browser.close()
      ]);

      return process.exit(config.COUNTER.failCount > 0 ? 1 : 0);
    }
  } catch(error) {
    config.lastFailedTestFiles = config.lastRanTestFiles;
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

function buildFilteredTests(filteredTests, outputPath) {
  return esbuild.build({
    stdin: {
      contents: filteredTests.reduce((result, fileAbsolutePath) => {
        return result + `import "${fileAbsolutePath}";`
      }, ''),
      resolveDir: process.cwd()
    },
    bundle: true,
    logLevel: 'error',
    outfile: outputPath
  });
}

async function runTestInsideHTMLFile(filePath, { page, server }, config) {
  let QUNIT_RESULT;
  let targetError;
  try {
    await wait(350);
    console.log('#', kleur.blue(`QUnitX running: http://localhost:${config.port}${filePath}`));
    await page.goto(`http://localhost:${config.port}${filePath}`, { timeout: 0 });
    await page.evaluate(() => {
      window.IS_PUPPETEER = true;
    });
    await page.waitForFunction(`window.testTimeout >= ${config.timeout}`, { timeout: 0 });

    QUNIT_RESULT = await page.evaluate(() => window.QUNIT_RESULT);
  } catch(error) {
    targetError = error;
    console.log(error);
    console.error(error);
  }

  if (!QUNIT_RESULT || QUNIT_RESULT.totalTests === 0) {
    console.log(targetError);
    console.log('BROWSER: runtime error thrown during executing tests');
    console.error('BROWSER: runtime error thrown during executing tests');

    await failOnNonWatchMode(config.watch);
  } else if (QUNIT_RESULT.totalTests > QUNIT_RESULT.finishedTests) {
    console.log(targetError);
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

function wait(duration) {
  return new Promise((resolve) => setTimeout(() => { resolve() }, duration));
}
