
const compilers = require('../lib/compilers');
const keccak = require('../lib/sha3').keccak_256;
const geast = require('geast');
const VM = require('ethereumjs-vm');

geast.node('method', [ 'name', 'type', 'visibility', 'arguments', 'body' ]);

exports['run empty method'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.method('foo', 'void', 'public', [], geast.sequence([]));
    
    compiler.process(node);
    
    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');

    test.async();
    
    vm.runCode({ code: bytes, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.runState);
        test.ok(data.runState.stack);
        test.equal(data.runState.stack.length, 0);
        test.ok(data.return);
        test.equal(data.return.length, 0);
        test.done();
    });
}

exports['run method that returns a constant'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.method('foo', 'uint', 'public', [], 
        geast.sequence([ geast.return(geast.constant(42)) ]));
    
    compiler.process(node);
    
    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');

    test.async();
    
    vm.runCode({ code: bytes, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.runState);
        test.ok(data.runState.stack);
        test.equal(data.runState.stack.length, 0);
        test.ok(data.return);
        test.equal(data.return.length, 32);
        test.equal(parseInt(data.return.toString('hex'), 16), 42);
        test.done();
    });
}

exports['run method that receives an argument and returns value'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.method('foo', 'uint', 'public',
        [ geast.argument('value', 'uint') ], 
        geast.sequence([
            geast.return(
                geast.binary('+', 
                    geast.name('value'), 
                    geast.constant(1))
            )
        ])
    );
    
    compiler.process(node);
    
    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');
    const data = Buffer.from('666666660000000000000000000000000000000000000000000000000000000000000001', 'hex');

    test.async();
    
    vm.runCode({ code: bytes, data: data, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.runState);
        test.ok(data.runState.stack);
        test.equal(data.runState.stack.length, 0);
        test.ok(data.return);
        test.equal(data.return.length, 32);
        test.equal(parseInt(data.return.toString('hex'), 16), 2);
        test.done();
    });
}

exports['run method that declares local variable with value and return its value'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.method('foo', 'uint', 'public',
        [], 
        geast.sequence([
            geast.variable('answer', 'uint', geast.constant(42)),
            geast.variable('k', 'uint', geast.constant(0)),
            geast.return(geast.name('answer'))
        ])
    );
    
    compiler.process(node);
    
    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');
    const data = Buffer.from('66666666', 'hex');

    test.async();
    
    vm.runCode({ code: bytes, data: data, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.return);
        test.equal(data.return.length, 32);
        test.equal(parseInt(data.return.toString('hex'), 16), 42);
        test.done();
    });
}

exports['run method that declares local variable with value, modify it and return its value'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.method('foo', 'uint', 'public',
        [], 
        geast.sequence([
            geast.variable('answer', 'uint', geast.constant(21)),
            geast.variable('k', 'uint', geast.constant(0)),
            geast.assign(geast.name('answer'),
                geast.binary('*', geast.name('answer'), geast.constant(2))
            ),
            geast.return(geast.name('answer'))
        ])
    );
    
    compiler.process(node);
    
    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');
    const data = Buffer.from('66666666', 'hex');

    test.async();
    
    vm.runCode({ code: bytes, data: data, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.return);
        test.equal(data.return.length, 32);
        test.equal(parseInt(data.return.toString('hex'), 16), 42);
        test.done();
    });
}

