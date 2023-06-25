// This tool turns package.json imports into deno.json. Also binary make const mappings(without npm:) npm packages to asset-map.json?
import fs from 'fs/promises';

const packageJSON = JSON.parse(await fs.readFile('./package.json', 'utf8'));

packageJSON.imports = packageJSON.imports || {};

const assetMapContents = Object.keys(packageJSON.imports).reduce((result, dependencyName) => {
  Object.assign(result.imports, {
    [dependencyName]: packageJSON.imports[dependencyName]['deno'] || packageJSON.imports[dependencyName]['default'] || packageJSON.imports[dependencyName]['browser']
  });

  return result;
}, { imports: {} });

await fs.writeFile('./deno.json', JSON.stringify(assetMapContents, null, 2), 'utf8');
