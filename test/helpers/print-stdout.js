export default function printStdout(stdout) {
  console.log(stdout.split('\n').map((char, index) => `${index}: ${char}`).join('\n'));
}
