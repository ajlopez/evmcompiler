
const compilers = require('../lib/compilers');
const geast = require('geast');
const VM = require('ethereumjs-vm');

function runCode(code, cb) {
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');
    
    vm.runCode({ code: bytes, gasLimit: 30000000 }, cb);
}

exports['compile and run add numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('+', geast.constant(41), geast.constant(1));
    
    compiler.process(constant);
    
    test.async();

    runCode(compiler.bytecodes(), function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.runState);
        test.ok(data.runState.stack);
        test.equal(data.runState.stack.length, 1);
        test.equal(data.runState.stack.pop().toString('hex'), '2a');
        test.done();
    });
};

exports['compile and run subtract numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('-', geast.constant(44), geast.constant(2));
    
    compiler.process(constant);
    
    test.async();

    runCode(compiler.bytecodes(), function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.runState);
        test.ok(data.runState.stack);
        test.equal(data.runState.stack.length, 1);
        test.equal(data.runState.stack.pop().toString('hex'), '2a');
        test.done();
    });
};

