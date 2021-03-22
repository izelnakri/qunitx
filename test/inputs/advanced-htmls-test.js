import assert from 'assert';

describe('Advanced HTML Input Tests', function() {
  it('testing with specific html without content works', async function() {
    const { stdout } = await shell('node cli.js test/helpers/index-without-content.html');

    console.log(stdout);

    assert.match(stdout, /Hello from index-without-content.html/);
  });
});

// html without content
// html without content --browser --debug
// html with content
// html with content  --browser --debug
// multiple htmls
// multiple htmls --browser --debug --output
