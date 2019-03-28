
const keccak = require('../lib/sha3').keccak_256;

function functionHash(signature) {
    return keccak(signature).substring(0, 8);
}

exports['generate function hashes'] = function (test) {
    test.equal(functionHash("increment()"), "d09de08a");
    test.equal(functionHash("getCounter()"), "8ada066e");
    test.equal(functionHash("add(uint256)"), "1003e2d2");
};
