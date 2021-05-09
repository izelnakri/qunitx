import assert from 'assert';
import setupTestFilePaths from '../../lib/setup/test-file-paths.js';

describe('Setup | test-file-paths tests', function() {
  it('setupTestFilePaths() works correctly on different inputs', function() {
    let projectRoot = '/home/izelnakri/Github/qunitx';

    assert.deepEqual(setupTestFilePaths(projectRoot, [
      `${projectRoot}/tmp`,
      `${projectRoot}/tmp/vendor`,
      `${projectRoot}/another/first/*`,
      `${projectRoot}/another/first/something/helpers`,
      `${projectRoot}/tmp/build-*`,
      `${projectRoot}/vendor`,
      `${projectRoot}/vendor-*`,
      `${projectRoot}/vendor-*/files`,
      `${projectRoot}/tests/**/something/*-test.ts`,
      `${projectRoot}/tests/**/*.ts`,
      `${projectRoot}/assets/something-test.ts`,
      `${projectRoot}/assets/*-test.js`,
      `${projectRoot}/tmp/build-*/*-test.ts`,
      `${projectRoot}/vendor/*-test.js`,
    ]), [
      `${projectRoot}/tmp`,
      `${projectRoot}/another/first/*`,
      `${projectRoot}/vendor`,
      `${projectRoot}/vendor-*`,
      `${projectRoot}/tests/**/*.ts`,
      `${projectRoot}/assets/*-test.js`,
      `${projectRoot}/assets/something-test.ts`,
    ]);
  });
});
