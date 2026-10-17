/**
 * qunitx where a DOM exists, as tests of browser code have one outside a browser:
 * jsdom's window comes first, then qunitx. QUnit puts itself on that window, and
 * refuses to load a second time once it is there, so this fails if a build of
 * qunitx carries two copies of it.
 *
 * Run by scripts/test-release.sh against the installed tarball, under Node.js and Deno.
 */
import { JSDOM } from 'jsdom';

const { window } = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/' });
Object.assign(globalThis, { window, document: window.document });

const { module, test } = await import('qunitx');

module('qunitx with a DOM', () => {
  test('runs tests, with every assertion', (assert) => {
    assert.deepEqual({ list: [1, 2] }, { list: [1, 2] });
    assert.strictEqual(window.document.body.tagName, 'BODY');
  });
});
