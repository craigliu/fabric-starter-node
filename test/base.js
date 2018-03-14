const os = require('os');
const path = require('path');
const tape = require('tape');
const tapePromise = require('tape-promise').default;

let test = tapePromise(tape);

const tempdir = path.join(os.tmpdir(), 'fabric-starter-node');

test = ((context, f) => (...args) => {
  // eslint-disable-next-line no-param-reassign
  args[0] = `\n\n******* ${args[0]} *******\n`;
  f.apply(context, args);
})(this, test);

module.exports = test;
module.exports.tempdir = tempdir;
