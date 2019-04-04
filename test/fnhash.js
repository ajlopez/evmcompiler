
const evmcompiler = require('..');

exports['function hashes'] = function (test) {
    test.equal(evmcompiler.fnhash("increment()"), "d09de08a");
    test.equal(evmcompiler.fnhash("getCounter()"), "8ada066e");
    test.equal(evmcompiler.fnhash("add(uint256)"), "1003e2d2");
};

