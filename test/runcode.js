
const compilers = require('../lib/compilers');
const keccak = require('../lib/sha3').keccak_256;
const contexts = require('../lib/contexts');
const geast = require('geast');
const VM = require('ethereumjs-vm');

exports['run conditional command'] = function (test) {
    const compiler = compilers.compiler();
    const context = contexts.context();
    context.scope('method');
    context.fn({ arity: 0 });
    compiler.context(context);
    const node = geast.conditional(
        geast.constant(1),
        geast.return(geast.constant(42)),
        geast.return(geast.constant(1))
    );
    
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
};

exports['run else command in conditional command'] = function (test) {
    const compiler = compilers.compiler();
    const context = contexts.context();
    context.scope('method');
    context.fn({ arity: 0 });
    compiler.context(context);
    const node = geast.conditional(
        geast.constant(0),
        geast.return(geast.constant(42)),
        geast.return(geast.constant(1))
    );
    
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
        test.equal(parseInt(data.return.toString('hex'), 16), 1);
        test.done();
    });
};

exports['run conditional command without else command'] = function (test) {
    const compiler = compilers.compiler();
    const context = contexts.context();
    context.scope('method');
    context.fn({ arity: 0 });
    compiler.context(context);
    const node = geast.conditional(
        geast.constant(1),
        geast.return(geast.constant(42))
    );
    
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
};

