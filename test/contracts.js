
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
    
    const result = compiler.fns();
    
    test.ok(result);
    test.ok(Array.isArray(result));
    test.equal(result.length, 1);
    
    test.equal(result[0].signature, "foo()");
    test.equal(result[0].hash, keccak("foo()").substring(0, 8));
    
    test.ok(compiler.context());
}

exports['process contract with variable declaration'] = function (test) {
    const compiler = compilers.compiler();
    
    const node = geast.contract('Counter',
        geast.sequence([
            geast.variable('counter', 'uint')
        ]));
        
    compiler.process(node);
    
    const result = compiler.fns();
    
    test.ok(result);
    test.ok(Array.isArray(result));
    test.equal(result.length, 0);
    
    const context = compiler.context();
    
    test.ok(context);
    
    const counter = context.get('counter');
    
    test.ok(counter);
    test.equal(counter.scope, 'contract');
    test.equal(counter.type, 'uint256');
}
