import fs from 'fs/promises';
import './after-script-basic.js';

export default async function(results) {
  let resultsInString = JSON.stringify(results, null, 2);

  await fs.rm(`${process.cwd()}/tmp/results.json`, { force: true, recursive: true });
  await fs.writeFile(`${process.cwd()}/tmp/results.json`, resultsInString);

  console.log('After script result is written:');
  console.log(resultsInString);
}

