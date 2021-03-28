import runTestsInNode from './run/tests-in-node.js';
import runTestsInBrowser from './run/tests-in-browser.js';
// let tree = Object.assign(tree, directoryReader(config, inputs, (file) => {
//   import(`${file}`);
// }));
// TODO: make it run an in-memory html if not exists

export default async function(config) {
  if (config.browser) {
    await runTestsInBrowser(config.fileOrFolderInputs, config); // NOTE: cannot do test files individually/requires bundling?
  } else {
    await runTestsInNode(config.fileOrFolderInputs, config); // NOTE: can do test files individually
  }
}
