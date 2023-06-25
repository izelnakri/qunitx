import { module, test } from 'qunitx';
import setupTestFilePaths from '../../lib/setup/test-file-paths.js';

module('Setup | glob(*) input tests | test-file-paths tests', () => {
  test('setupTestFilePaths() works correctly on different inputs', (assert) => {
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
