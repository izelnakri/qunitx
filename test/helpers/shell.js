import { promisify } from 'node:util';
import { exec } from 'node:child_process';

const shell = promisify(exec);

export default async function execute(commandString, { moduleName = '', testName = '' } = {}) {
  try {
    let result = await shell(commandString);
    let { stdout, stderr } = result;

    console.trace(`
      TEST NAME: ${moduleName} | ${testName}
      TEST COMMAND: ${commandString}
      ${stdout.split('\n').map((line, index) => `${index}: ${line}`).join('\n')}
    `);

    if (stderr && stderr !== '') {
      console.trace(`
        TEST NAME: ${moduleName} | ${testName}
        TEST COMMAND: ${commandString}
        ${stderr.split('\n').map((line, index) => `${index}: ${line}`).join('\n')}
      `);
    }

    return result;
  } catch (error) {
    console.trace(`
      ERROR TEST Name: ${moduleName} | ${testName}
      ERROR TEST COMMAND: ${commandString}
      ${error}
    `);

    throw error;;
  }


}
