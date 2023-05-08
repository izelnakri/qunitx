import fs from 'node:fs/promises';
import crypto from 'node:crypto';

export async function writeTestFolder(options={ addFailingTests: false, mixedExtensions: false }) {
  let { addFailingTests, mixedExtensions } = options;
  let folderName = crypto.randomUUID();
  let extension = mixedExtensions ? 'ts' : 'js';
  let [passingsTestTemplate, failingTestTemplate] = await Promise.all([
    fs.readFile(`${process.cwd()}/test/helpers/passing-tests.js`),
    options.addFailingTests ? fs.readFile(`${process.cwd()}/test/helpers/failing-tests.js`) : null,
    fs.mkdir(`${process.cwd()}/tmp/${folderName}`, { recursive: true })
  ]);

  await Promise.all([
    writeTestFile(folderName, 'first-module-pass', 'js', passingsTestTemplate),
    writeTestFile(folderName, 'second-module-pass', extension, passingsTestTemplate),
    addFailingTests ? writeTestFile(folderName, 'first-module-fail', 'js', failingTestTemplate) : null,
    addFailingTests ? writeTestFile(folderName, 'second-module-fail', extension, failingTestTemplate) : null,
    addFailingTests ? writeTestFile(folderName, 'third-module-fail', extension, failingTestTemplate) : null,
  ]);


  return folderName;
}

export function writeTestFile(folderName, testFileName, extension, templateBuffer) {
  return fs.writeFile(
    `${process.cwd()}/tmp/${folderName}/${testFileName}.${extension}`,
    templateBuffer.toString().replace('{{moduleName}}', `${folderName} | ${testFileName}`)
  );
}

export default {
  writeTestFolder,
  writeTestFile
};
