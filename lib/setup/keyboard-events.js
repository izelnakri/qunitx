import kleur from 'kleur';
import listenToKeyboardKey from '../utils/listen-to-keyboard-key.js';
import runTestsInBrowser from '../commands/run/tests-in-browser.js';

export default function setupKeyboardEvents(config, cachedContent, connections) {
  listenToKeyboardKey('qq', () => abortBrowserQUnit(config, connections));
  listenToKeyboardKey('qa', () => {
    abortBrowserQUnit(config, connections);
    runTestsInBrowser(config, cachedContent, connections)
  });
  listenToKeyboardKey('qf', () => {
    abortBrowserQUnit(config, connections);

    if (!config.lastFailedTestFiles) {
      console.log('#', kleur.blue(`QUnitX: No tests failed so far, so repeating the last test run`));
      return runTestsInBrowser(config, cachedContent, connections, config.lastRanTestFiles);
    }

    runTestsInBrowser(config, cachedContent, connections, config.lastFailedTestFiles)
  });
  listenToKeyboardKey('ql', () => {
    abortBrowserQUnit(config, connections);
    runTestsInBrowser(config, cachedContent, connections, config.lastRanTestFiles)
  });
}

function abortBrowserQUnit(config, connections) {
  connections.server.publish('abort', 'abort');
}

function abortNodejsQUnit(config) {
  window.QUnit.config.queue.length = 0;
  config.aborted = true;
}
