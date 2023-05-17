import fs from 'node:fs/promises';

export default async function writeOutputStaticFiles({ projectRoot, output }, cachedContent) {
  let staticHTMLPromises = Object.keys(cachedContent.staticHTMLs).map(async (staticHTMLKey) => {
    let htmlRelativePath = staticHTMLKey.replace(`${projectRoot}/`, '');

    await ensureFolderExists(`${projectRoot}/${output}/${htmlRelativePath}`);
    await fs.writeFile(`${projectRoot}/${output}/${htmlRelativePath}`, cachedContent.staticHTMLs[staticHTMLKey]);
  });
  let assetPromises = Array.from(cachedContent.assets).map(async (assetAbsolutePath) => {
    let assetRelativePath = assetAbsolutePath.replace(`${projectRoot}/`, '');

    await ensureFolderExists(`${projectRoot}/${output}/${assetRelativePath}`);
    await fs.copyFile(assetAbsolutePath, `${projectRoot}/${output}/${assetRelativePath}`);
  });

  await Promise.all(staticHTMLPromises.concat(assetPromises));
}

async function ensureFolderExists(assetPath) {
  await fs.mkdir(assetPath.split('/').slice(0, -1).join('/'), { recursive: true });
}
