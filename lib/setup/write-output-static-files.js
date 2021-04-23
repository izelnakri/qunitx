import fs from 'fs/promises';

// TODO: to write files to /tmp for debug
export default async function writeOutputFiles({ projectRoot, output }, cachedContent) {
  let htmlPromises = Object.keys(cachedContent.staticHTMLs).map(async (staticHTMLKey) => {
    await fs.writeFile(`${projectRoot}/${output}/${staticHTMLKey}`, cachedContent.staticHTMLs[staticHTMLKey]);
  });
  let assetPromises = Object.keys(cachedContent.assets).map(async (assetKey) => {
    await fs.writeFile(`${projectRoot}/${output}/${assetKey}`, cachedContent.assets[assetKey]);
  });

  await Promise.all([
    fs.writeFile(
      `${projectRoot}/${output}/index.html`,
      cachedContent.mainHTML.html.replace('{{content}}', testRuntimeToInjectForStaticServe(cachedContent.allTestCode))
    ),
    htmlPromises,
    assetPromises
  ]);
}

function testRuntimeToInjectForStaticServe(allTestCode) {
  return `
    ${allTestCode}

    function setupQUnit() {
      window.setTimeout(() => window.QUnit.start(), 10);
    }

    setupQUnit();
  `;
}
