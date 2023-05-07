import fs from 'node:fs/promises';

process.env['FORCE_COLOR'] = 0;

await fs.rm('./tmp', { recursive: true, force: true });
await fs.mkdir('./tmp/test', { recursive: true });
let [failingTestContent, passingTestContent] = await Promise.all([
  fs.readFile('./test/helpers/failing-tests.js'),
  fs.readFile('./test/helpers/passing-tests.js'),
]);

await Promise.all([
  fs.writeFile('./tmp/test/failing-tests.js', failingTestContent.toString()),
  fs.writeFile('./tmp/test/failing-tests.ts', failingTestContent.toString()),
  fs.writeFile('./tmp/test/passing-tests.js', passingTestContent.toString()),
  fs.writeFile('./tmp/test/passing-tests.ts', passingTestContent.toString())
]);
