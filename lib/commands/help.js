import fs from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import kleur from 'kleur';

const __dirname = dirname(fileURLToPath(import.meta.url));
const highlight = (text) => kleur.magenta().bold(text);
const color = (text) => kleur.blue(text);


export default async function() {
  const config = JSON.parse((await fs.readFile(`${__dirname}/../../package.json`)));

  console.log(`${highlight("[qunitx v" + config.version + "] Usage:")} qunitx ${color('[targets] --$flags')}

${highlight("Input options:")}
- File: $ ${color('qunitx test/foo.js')}
- Folder: $ ${color('qunitx test/login')}
- Globs: $ ${color('qunitx test/**/*-test.js')}
- Combination: $ ${color('qunitx test/foo.js test/bar.js test/*-test.js test/logout')}

${highlight("Optional flags:")}
${color('--browser')} : run qunit tests in chromium with puppeteer instead of node.js(which is the default)
${color('--debug')} : print console output when tests run in browser
${color('--watch')} : run the target file or folders, watch them for continuous run and expose http server under localhost
${color('--timeout')} : change default timeout per test case
${color('--output')} : folder to distribute built qunitx html and js that a webservers can run[default: tmp]
${color('--failFast')} : run the target file or folders with immediate abort if a single test fails
${color('--before')} : run a script before the tests(i.e start a new web server before tests)
${color('--after')} : run a script after the tests(i.e save test results to a file)

${highlight("Example:")} $ ${color('qunitx test/foo.ts app/e2e --browser --debug --watch --before=scripts/start-new-webserver.js --after=scripts/write-test-results.js')}

${highlight("Commands:")}
${color('$ qunitx init')}               # Bootstraps qunitx base html and add qunitx config to package.json if needed
${color('$ qunitx new $testFileName')}  # Creates a qunitx test file
`);
}
