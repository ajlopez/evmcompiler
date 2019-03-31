
const compilers = require('../lib/compilers');
const keccak = require('../lib/sha3').keccak_256;
const geast = require('geast');

geast.node('method', [ 'name', 'type', 'visibility', 'arguments', 'body' ]);
geast.node('contract', [ 'name', 'body' ]);

function toHex2(value) {
    let result = value.toString(16);
    
    if (result.length < 4)
        result = '0'.repeat(4 - result.length) + result;
    
    return result;
}

function resolve(bytecodes, value) {
    const offset = bytecodes.indexOf('____');
    
    return bytecodes.substring(0, offset)
    + toHex2(value)
    + bytecodes.substring(offset + 4);
}

exports['process contract with empty method'] = function (test) {
    const compiler = compilers.compiler();
    
    const node = geast.contract('Counter',
        geast.sequence([
            geast.method('foo', 'void', 'public', [], geast.return())
        ]));
        
    compiler.process(node);

    let prologue = '3660041061____5735'
        + '7c0100000000000000000000000000000000000000000000000000000000'
        + '900463ffffffff1680'
        + '63' + keccak("foo()").substring(0, 8)
        + '1461____57';
        
    const offrevert = prologue.length / 2;
    
    prologue += '5bfd';
    
    const offmethod = prologue.length / 2;
    
    prologue = resolve(prologue, offrevert);
    prologue = resolve(prologue, offmethod);
    
    test.equal(compiler.bytecodes(), prologue + "5b60006000f3");

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
    test.strictEqual(counter.offset, 0);
}

exports['process contract with two variable declaration'] = function (test) {
    const compiler = compilers.compiler();
    
    const node = geast.contract('Counter',
        geast.sequence([
            geast.variable('counter', 'uint'),
            geast.variable('total', 'uint')
        ]));
        
    compiler.process(node);
    
    const context = compiler.context();
    
    test.ok(context);
    
    const counter = context.get('counter');
    
    test.ok(counter);
    test.equal(counter.scope, 'contract');
    test.equal(counter.type, 'uint256');
    test.strictEqual(counter.offset, 0);
    
    const total = context.get('total');
    
    test.ok(total);
    test.equal(total.scope, 'contract');
    test.equal(total.type, 'uint256');
    test.strictEqual(total.offset, 1);
}
