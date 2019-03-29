
const compilers = require('../lib/compilers');
const geast = require('geast');

geast.node('method', [ 'name', 'type', 'visibility', 'arguments', 'body' ]);

exports['process empty method'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.method('foo', 'void', 'public', [], geast.return());
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "5b60006000f3");
}

