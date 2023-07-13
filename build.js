import fs from 'fs/promises';

let [qunitJS, qunitCSS, _] = await Promise.all([
  fs.readFile('./node_modules/qunit/qunit/qunit.js'),
  fs.readFile('./node_modules/qunit/qunit/qunit.css'),
  fs.mkdir('./vendor', { recursive: true })
]);

let newQUnit = qunitJS.toString().replace(
  'start: function start(count) {',
  `reset: function() {
		ProcessingQueue.finished = false;
		globalStartCalled = false;
		runStarted = false;

		config.queue.length = 0;
		config.modules.length = 0;
		config.autostart = false;

    Object.assign(config.stats, { total: 0, passed: 0, failed: 0, skipped: 0, todo: 0 });

		[
			"started", "updateRate", "filter", "depth", "current",
			"pageLoaded", "timeoutHandler", "timeout", "pollution"
		].forEach( ( key ) => delete config[ key ] );

		const suiteReport = config.currentModule.suiteReport;

		suiteReport.childSuites.length = 0;
		delete suiteReport._startTime;
		delete suiteReport._endTime;

		config.modules.push( config.currentModule );
  },
  start: function start(count) {`);

await Promise.all([
  fs.writeFile('./vendor/qunit.js', newQUnit),
  fs.writeFile('./vendor/qunit.css', qunitCSS),
  createPackageJSONIfNotExists()
]);

async function createPackageJSONIfNotExists() {
  try {
    await fs.stat('./vendor/package.json');

    return true;
  } catch (error) {
    await fs.writeFile('./vendor/package.json', JSON.stringify({
      name: 'qunitx-vendor',
      version: '0.0.1'
    }));
  }
}
