import assert from 'assert';
import { buildWatchPaths } from '../../lib/setup/config.js';

describe('Setup | config tests', function() {
  it('buildWatchPaths() works correctly on different inputs', async function() {
    let projectRoot = '/home/izelnakri/Github/qunitx';

    assert.deepEqual(buildWatchPaths(projectRoot, [
      `${projectRoot}/tmp`,
      `${projectRoot}/tmp/vendor`,
      `${projectRoot}/tmp/build-*`,
      `${projectRoot}/vendor`,
      `${projectRoot}/vendor-*`,
      `${projectRoot}/vendor-*/files`,
      `${projectRoot}/tests/**/*.ts`,
      `${projectRoot}/assets/something-test.ts`,
      `${projectRoot}/assets/*-test.js`,
      `${projectRoot}/tmp/build-*/*-test.ts`,
      `${projectRoot}/vendor/*-test.js`,
    ]), [
      `${projectRoot}/tmp`,
      `${projectRoot}/vendor-*`,
      `${projectRoot}/vendor`,
      `${projectRoot}/tests/**/*.ts`,
      `${projectRoot}/assets/*-test.js`,
      `${projectRoot}/assets/something-test.ts`,
    ]);
  });
});
