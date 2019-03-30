
const compilers = require('../lib/compilers');
const keccak = require('../lib/sha3').keccak_256;
const geast = require('geast');

geast.node('method', [ 'name', 'type', 'visibility', 'arguments', 'body' ]);
geast.node('contract', [ 'name', 'body' ]);

exports['process contract with empty method'] = function (test) {
    const compiler = compilers.compiler();
    
    const node = geast.contract('Counter',
        geast.sequence([
            geast.method('foo', 'void', 'public', [], geast.return())
        ]));
        
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "5b60006000f3");

    const context = compiler.context();
    
    test.ok(context);
    
    const fndef = context.get('foo()');
    
    test.ok(fndef);
    test.equal(fndef.signature, "foo()");
    test.equal(fndef.hash, keccak("foo()").substring(0, 8));
}

exports['process contract with variable declaration'] = function (test) {
    const compiler = compilers.compiler();
    
    const node = geast.contract('Counter',
        geast.sequence([
            geast.variable('counter', 'uint')
        ]));
        
    compiler.process(node);
    
    const context = compiler.context();
    
    test.ok(context);
    
    const counter = context.get('counter');
    
    test.ok(counter);
    test.equal(counter.scope, 'contract');
    test.equal(counter.type, 'uint256');
}
