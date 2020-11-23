
const compilers = require('../lib/compilers');
const keccak = require('../lib/sha3').keccak_256;
const geast = require('geast');

geast.node('contract', [ 'name', 'body' ]);
geast.node('method', [ 'name', 'type', 'arguments', 'body', 'attributes' ]);

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
            geast.method('foo', 'void', [], geast.sequence([]), { visibility: 'public' })
        ]));
        
    compiler.process(node);

    let prologue = '6004361061____57600035'
        + '7c0100000000000000000000000000000000000000000000000000000000'
        + '900463ffffffff1680'
        + '63' + keccak("foo()").substring(0, 8)
        + '1461____57';
        
    const offrevert = prologue.length / 2;
    
    prologue += '5bfd';
    
    const offmethod = prologue.length / 2;
    
    prologue = resolve(prologue, offrevert);
    prologue = resolve(prologue, offmethod);
    
    test.equal(compiler.bytecodes(), 
        prologue + "5b00");

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

exports['process contract with array variable declaration '] = function (test) {
    const compiler = compilers.compiler();
    
    const node = geast.contract('Counter',
        geast.sequence([
            geast.variable('data', geast.array('uint', geast.constant(10, 'uint'))),
            geast.variable('counter', 'uint')
        ]));
        
    compiler.process(node);
    
    const context = compiler.context();
    
    test.ok(context);
    
    const data = context.get('data');
    
    test.ok(data);
    test.equal(data.scope, 'contract');
    test.equal(data.type, 'uint256[]');
    test.strictEqual(data.offset, 0);
    test.strictEqual(data.length, 10);
    
    const counter = context.get('counter');
    
    test.ok(counter);
    test.equal(counter.scope, 'contract');
    test.equal(counter.type, 'uint256');
    test.strictEqual(counter.offset, 10);
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

exports['process contract with variable declaration and method returning variable'] = function (test) {
    const compiler = compilers.compiler();
    
    const node = geast.contract('Counter',
        geast.sequence([
            geast.variable('counter', 'uint'),
            geast.method('getCounter', 'uint', [], 
                geast.sequence([
                    geast.return(geast.name('counter'))
                ]),
                { visibility: 'public' }
            )
        ]));
        
    compiler.process(node);
    
    let prologue = '6004361061____57600035'
        + '7c0100000000000000000000000000000000000000000000000000000000'
        + '900463ffffffff1680'
        + '63' + keccak("getCounter()").substring(0, 8)
        + '1461____57';
        
    const offrevert = prologue.length / 2;
    
    prologue += '5bfd';
    
    const offmethod = prologue.length / 2;
    
    prologue = resolve(prologue, offrevert);
    prologue = resolve(prologue, offmethod);

    test.equal(compiler.bytecodes(), 
        prologue + "5b60005460005260206000f3");

    const context = compiler.context();
    
    test.ok(context);
    
    const counter = context.get('counter');
    
    test.ok(counter);
    test.equal(counter.scope, 'contract');
    test.equal(counter.type, 'uint256');
    test.strictEqual(counter.offset, 0);

    const getCounter = context.get('getCounter()');
    
    test.ok(getCounter);
    test.equal(getCounter.signature, "getCounter()");
    test.equal(getCounter.hash, keccak("getCounter()").substring(0, 8));
}

exports['process contract with variable declaration and method modifying variable'] = function (test) {
    const compiler = compilers.compiler();
    
    const node = geast.contract('Counter',
        geast.sequence([
            geast.variable('counter', 'uint'),
            geast.method('increment', 'void', [], 
                geast.sequence([
                    geast.assign(
                        geast.name('counter'), 
                        geast.binary('+', geast.name('counter'), geast.constant(1))
                    )
                ]),
                { visibility: 'public' }
            )
        ]));
        
    compiler.process(node);
    
    let prologue = '6004361061____57600035'
        + '7c0100000000000000000000000000000000000000000000000000000000'
        + '900463ffffffff1680'
        + '63' + keccak("increment()").substring(0, 8)
        + '1461____57';
        
    const offrevert = prologue.length / 2;
    
    prologue += '5bfd';
    
    const offmethod = prologue.length / 2;
    
    prologue = resolve(prologue, offrevert);
    prologue = resolve(prologue, offmethod);

    test.equal(compiler.bytecodes(), 
        prologue + "5b60016000540160005500");

    const context = compiler.context();
    
    test.ok(context);
    
    const counter = context.get('counter');
    
    test.ok(counter);
    test.equal(counter.scope, 'contract');
    test.equal(counter.type, 'uint256');
    test.strictEqual(counter.offset, 0);

    const increment = context.get('increment()');
    
    test.ok(increment);
    test.equal(increment.signature, "increment()");
    test.equal(increment.hash, keccak("increment()").substring(0, 8));
}

exports['process contract with variable declaration and method modifying variable using argument'] = function (test) {
    const compiler = compilers.compiler();
    
    const node = geast.contract('Counter',
        geast.sequence([
            geast.variable('counter', 'uint'),
            geast.method('add', 'void', [ geast.argument('value', 'uint') ], 
                geast.sequence([
                    geast.assign(
                        geast.name('counter'), 
                        geast.binary('+', geast.name('counter'), geast.name('value'))
                    )
                ]),
                { visibility: 'public' }
            )
        ]));
        
    compiler.process(node);
    
    let prologue = '6004361061____57600035'
        + '7c0100000000000000000000000000000000000000000000000000000000'
        + '900463ffffffff1680'
        + '63' + keccak("add(uint256)").substring(0, 8)
        + '1461____57';
        
    const offrevert = prologue.length / 2;
    
    prologue += '5bfd';
    
    const offmethod = prologue.length / 2;
    
    prologue = resolve(prologue, offrevert);
    prologue = resolve(prologue, offmethod);

    test.equal(compiler.bytecodes(), 
        prologue + "5b6004356000540160005500");

    const context = compiler.context();
    
    test.ok(context);
    
    const counter = context.get('counter');
    
    test.ok(counter);
    test.equal(counter.scope, 'contract');
    test.equal(counter.type, 'uint256');
    test.strictEqual(counter.offset, 0);

    const add = context.get('add(uint256)');
    
    test.ok(add);
    test.equal(add.signature, "add(uint256)");
    test.equal(add.hash, keccak("add(uint256)").substring(0, 8));
}

