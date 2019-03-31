
const compilers = require('../lib/compilers');
const keccak = require('../lib/sha3').keccak_256;
const geast = require('geast');

geast.node('method', [ 'name', 'type', 'visibility', 'arguments', 'body' ]);

exports['process empty method'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.method('foo', 'void', 'public', [], geast.sequence([]));
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "5b60006000f3");
}

