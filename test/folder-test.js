import test from 'ava';
import { v4 as uuid } from 'uuid';

test('works for a single folder input with all passing tests', async (t) => {
  t.true(true);
});

// test('works for a single folder input with few failing tests', async (t) => {
//   t.true(true);
// });

// test('works for a multiple folders input with all passing tests', async (t) => {
//   t.true(true);
// });

// test('works for a multiple folders input with few failing tests', async (t) => {
//   t.true(true);
// });

// test('works for a single folder input in browser mode with all passing tests', async (t) => {
//   t.true(true);
// });

// test('works for a single folder input in browser mode with few failing tests', async (t) => {
//   t.true(true);
// });

// test('works for a multiple folders input in browser mode with all passing tests', async (t) => {
//   t.true(true);
// });

// test('works for a multiple folders input in browser mode with few failing tests', async (t) => {
//   t.true(true);
// });

// test('works for a single folder input in browser mode with debug and all passing tests', async (t) => {
//   t.true(true);
// });

// test('works for a single folder input in browser mode with debug and few failing tests', async (t) => {
//   t.true(true);
// });

// test('works for a multiple folders input in browser mode with debug and all passing tests', async (t) => {
//   t.true(true);
// });

// test('works for a multiple folders input in browser mode with debug and few failing tests', async (t) => {
//   t.true(true);
// });


async function createTestFolder(options={ addFailingTests: false, mixedExtensions: false }) {
  let { addFailingTests, mixedExtensions } = options;
  let folderName = uuid();
  let extension = mixedExtensions ? 'ts' : 'js';
  let [passingsTestTemplate, failingTestTemplate] = await Promise.all([
    fs.readFile(`${process.cwd()}/test/helpers/passing-tests.js`),
    options.addFailingTests fs.readFile(`${process.cwd()}/test/helpers/failing-tests.js`) : null,
    fs.mkdir(`${process.cwd()}/tmp/${folderName}`, { recursive: true });
  ]);

  await Promise.all([
    writeTestFile(folderName, 'first-module-pass', 'js', passingsTestTemplate),
    writeTestFile(folderName, 'second-module-pass', extension, passingsTestTemplate),
    addFailingTests ? writeTestFile(folderName, 'first-module-fail', 'js', failingTestTemplate) : null,
    addFailingTests ? writeTestFile(folderName, 'second-module-fail', mixedExtensions, failingTestTemplate) : null,
    addFailingTests ? writeTestFile(folderName, 'third-module-fail', mixedExtensions, failingTestTemplate) : null,
  ]);

  return folderName;
}

async function writeTestFile(folderName, testFileName, extension, templateBuffer) {
  await fs.writeFile(
    `${process.cwd()}/${folderName}/${testFileName}/${extension}`,
    templateBuffer.toString().replace('{{moduleName}}', `${folderName} | ${testFileName}`)
  );
}
