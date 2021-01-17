import fs from 'fs/promises';
import chalk from 'chalk';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const highlight = (text) => chalk.magenta.bold(text);
const color = (text) => chalk.blue(text);


export default async function() {
  const config = JSON.parse((await fs.readFile(`${__dirname}/../../package.json`)));

  console.log(`${highlight("[qunitx v" + config.version + "] Usage:")} qunitx ${color('[targets] --$flags')}

${highlight("Input options:")}
- File: $ ${color('qunitx test/foo.js')}
- Folder: $ ${color('qunitx test/login')}
- Glob: $ ${color('qunitx test/**/*.ts')}
- Regex: $ ${color('qunit *-test.ts')}
- Combination: $ ${color('qunit test/foo.js test/bar.js test/logout app/e2e/submit-*.ts')}

${highlight("Optional flags:")}
${color('--browser')} [default] : run qunit tests in chromium instead of node.js(with puppeteer)
${color('--node')} : run qunit tests in node.js without spawning a chromium/puppeteer
${color('--debug')} : print console output when tests run in browser
${color('--watch')} : run the target file or folders and watch them for continuous run
${color('--failFast')} : run the target file or folders with immediate abort if a single test fails
${color('--reporter')} : define a reporter
${color('--coverage')} : define a coverage dist folder target(by default ./dist)

${highlight("Example:")} $ ${color('qunitx test/foo.ts#204 app/e2e --debug --watch')}
`);
}
