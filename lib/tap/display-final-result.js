export default function({ testCount, passCount, skipCount, failCount }, timeTaken) {
  console.log('');
  console.log(`1..${testCount}`);
  console.log(`# tests ${testCount}`);
  console.log(`# pass ${passCount}`);
  console.log(`# skip ${skipCount}`);
  console.log(`# fail ${failCount}`);

  // let seconds = timeTaken > 1000 ? Math.floor(timeTaken / 1000) : 0;
  // let milliseconds = timeTaken % 100;

  console.log(`# duration ${timeTaken}`);
  console.log('');
}
  // console.log(details.timeTaken); // runtime
