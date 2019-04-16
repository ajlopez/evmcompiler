
const compilers = require('../lib/compilers');
const keccak = require('../lib/sha3').keccak_256;
const geast = require('geast');
const contexts = require('../lib/contexts');

exports['process empty method'] = function (test) {
    const compiler = compilers.compiler();
    compiler.context(contexts.context());
    const node = geast.method('foo', 'void', 'public', [], geast.sequence([]));
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "5b00");
}

