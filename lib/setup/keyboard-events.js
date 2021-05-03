import kleur from 'kleur';
import listenToKeyboardKey from '../utils/listen-to-keyboard-key.js';
import runTestsInNode from '../commands/run/tests-in-node.js';
import runTestsInBrowser from '../commands/run/tests-in-browser.js';

export default function setupKeyboardEvents(config, cachedContent, connections) {
  if (config.browser) {
    listenToKeyboardKey('qa', () => {
      config.aborted =
      runTestsInBrowser(config.fileOrFolderInputs, config, cachedContent, connections)
    });
    listenToKeyboardKey('qf', () => {
      if (!config.lastFailedTestFiles) {
        console.log('#', kleur.blue(`QUnitX: No tests failed so far, so repeating the last test run`));
        return runTestsInBrowser(config.lastRanTestFiles, config, cachedContent, connections);
      }
      runTestsInBrowser(config.lastFailedTestFiles, config, cachedContent, connections)
    });
    listenToKeyboardKey('ql', () => {
      runTestsInBrowser(config.lastRanTestFiles, config, cachedContent, connections)
    });
  } else {
    listenToKeyboardKey('qa', () => {
      abortNodejsQUnit(config);
      runTestsInNode(config.fileOrFolderInputs, config)
    });
    listenToKeyboardKey('qf', () => {
      abortNodejsQUnit(config);

      if (!config.lastFailedTestFiles) {
        console.log('#', kleur.blue(`QUnitx: No tests failed so far, so repeating the last test run`));
        return runTestsInNode(config.lastRanTestFiles, config);
      }
      runTestsInNode(config.lastFailedTestFiles, config)
    });
    listenToKeyboardKey('ql', () => {
      abortNodejsQUnit(config);
      runTestsInNode(config.lastRanTestFiles, config)
    });
  }
}

function abortNodejsQUnit(config) {
  window.QUnit.config.queue.length = 0;
  config.aborted = true;
}
