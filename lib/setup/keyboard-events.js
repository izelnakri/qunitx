import kleur from 'kleur';
import listenToKeyboardKey from '../utils/listen-to-keyboard-key.js';
import runTestsInNode from '../commands/run/tests-in-node.js';
import runTestsInBrowser from '../commands/run/tests-in-browser.js';

export default function setupKeyboardEvents(config, cachedContent, connections) {
  if (config.browser) {
    listenToKeyboardKey('qq', () => abortBrowserQUnit(config, connections));
    listenToKeyboardKey('qa', () => {
      abortBrowserQUnit(config, connections);
      runTestsInBrowser(Object.keys(config.fsTree), config, cachedContent, connections)
    });
    listenToKeyboardKey('qf', () => {
      abortBrowserQUnit(config, connections);

      if (!config.lastFailedTestFiles) {
        console.log('#', kleur.blue(`QUnitX: No tests failed so far, so repeating the last test run`));
        return runTestsInBrowser(config.lastRanTestFiles, config, cachedContent, connections);
      }
      runTestsInBrowser(config.lastFailedTestFiles, config, cachedContent, connections)
    });
    listenToKeyboardKey('ql', () => {
      abortBrowserQUnit(config, connections);
      runTestsInBrowser(config.lastRanTestFiles, config, cachedContent, connections)
    });
  } else {
    listenToKeyboardKey('qq', () => abortNodejsQUnit(config));
    listenToKeyboardKey('qa', () => {
      abortNodejsQUnit(config);
      runTestsInNode(Object.keys(config.fsTree), config)
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

function abortBrowserQUnit(config, connections) {
  connections.server.publish('abort', 'abort');
}

function abortNodejsQUnit(config) {
  window.QUnit.config.queue.length = 0;
  config.aborted = true;
}
