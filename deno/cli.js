import process from "node:process";
import displayHelpOutput from '../lib/commands/help.js';

process.title = 'qunitx';

(async () => {
  if (!process.argv[2]) {
    return await displayHelpOutput();
  } else if (['help', 'h', 'p', 'print'].includes(process.argv[2])) {
    return await displayHelpOutput();
  }
  // else if (['new', 'n', 'g', 'generate'].includes(process.argv[2])) {
  //   return await generateTestFiles();
  // } else if (['init'].includes(process.argv[2])) {
  //   return await initializeProject();
  // }

  // let config = await setupConfig();

  // return await run(config);
})();
