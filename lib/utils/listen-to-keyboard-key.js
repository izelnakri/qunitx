let stdin = process.stdin;

stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

let targetInputs = {};
let inputs = [];

stdin.on('data', function(key){
  if (key === '\u0003') {
    process.exit(); // so node process doesnt trap Control-C
  }

  inputs.shift();
  inputs.push(key);

  let inputString = inputs.join('');
  let targetListener = targetInputs[inputString.toUpperCase()];
  if (targetListener && targetListenerConformsToCase(targetListener, inputString)) {
    targetListener.closure(inputString);
    inputs.fill(undefined);
  }
});

export default function listenToKeyboardKey(inputString, closure, options = { caseSensitive: false }) {
  if (inputString.length > inputs.length) {
    inputs.length = inputString.length;
  }

  targetInputs[inputString.toUpperCase()] = Object.assign(options, { closure });
}

function targetListenerConformsToCase(targetListener, inputString) {
  if (targetListener.caseSensitive) {
    return inputString === inputString.toUpperCase();
  }

  return true;
}
