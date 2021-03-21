import fs from 'fs/promises';
import kleur from 'kleur';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const highlight = (text) => kleur.magenta().bold(text);
const color = (text) => kleur.blue(text);


export default async function() {
  const config = JSON.parse((await fs.readFile(`${__dirname}/../../package.json`)));

  console.log(`${highlight("[qunitx v" + config.version + "] Usage:")} qunitx ${color('[targets] --$flags')}

${highlight("Input options:")}
- File: $ ${color('qunitx test/foo.js')}
- Folder: $ ${color('qunitx test/login')}
- Combination: $ ${color('qunitx test/foo.js test/bar.js test/logout')}

${highlight("Optional flags:")}
${color('--browser')} : run qunit tests in chromium with puppeteer instead of node.js(which is the default)
${color('--debug')} : print console output when tests run in browser
${color('--watch')} : run the target file or folders and watch them for continuous run
${color('--timeout')} : change default timeout per test case
${color('--outputPath')} : folder to distribute built qunitx html and js that a webservers can run[default: tmp]
${color('--failFast')} : run the target file or folders with immediate abort if a single test fails

${highlight("Example:")} $ ${color('qunitx test/foo.ts app/e2e --browser --debug --watch')}

${highlight("Commands:")}
${color('$ qunitx init')}               # Bootstraps qunitx base html and add qunitx config to package.json if needed
${color('$ qunitx new $testFileName')}  # Creates a qunitx test file
`);
}
