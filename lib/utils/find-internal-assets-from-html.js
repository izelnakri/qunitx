import cheerio from 'cheerio';

const ABSOLUTE_URL_REGEX = new RegExp('^(?:[a-z]+:)?//', 'i');

export default function findInternalAssetsFromHTML(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const internalJSFiles = $('script[src]').toArray()
    .map((scriptNode) => $(scriptNode).attr('src'))
    .filter((uri) => !ABSOLUTE_URL_REGEX.test(uri));
  const internalCSSFiles = $('link[href]').toArray()
    .map((scriptNode) => $(scriptNode).attr('href'))
    .filter((uri) => !ABSOLUTE_URL_REGEX.test(uri));

  return internalCSSFiles.concat(internalJSFiles);
    // TODO: maybe needs normalization ? .map((fileReferencePath) => fileReferencePath.replace('/assets', `${projectRoot}/tmp/assets`));
}
