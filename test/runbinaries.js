
const compilers = require('../lib/compilers');
const geast = require('geast');
const VM = require('ethereumjs-vm');

function runCode(test, code, expected) {
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');
    
    vm.runCode({ code: bytes, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.runState);
        test.ok(data.runState.stack);
        test.equal(data.runState.stack.length, 1);
        test.equal(parseInt(data.runState.stack.pop().toString('hex'), 16), expected);
        test.done();
    });
}

exports['compile and run add numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('+', geast.constant(41), geast.constant(1));
    
    compiler.process(constant);
    
    test.async();

    runCode(test, compiler.bytecodes(), 42);
};

exports['compile and run subtract numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('-', geast.constant(44), geast.constant(2));
    
    compiler.process(constant);
    
    test.async();

    runCode(test, compiler.bytecodes(), 42);
};

exports['compile and run multiply numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('*', geast.constant(21), geast.constant(2));
    
    compiler.process(constant);
    
    test.async();

    runCode(test, compiler.bytecodes(), 42);
};

exports['compile and run divide numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('/', geast.constant(84), geast.constant(2));
    
    compiler.process(constant);
    
    test.async();

    runCode(test, compiler.bytecodes(), 42);
};

exports['compile and run mod numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('%', geast.constant(7), geast.constant(4));
    
    compiler.process(constant);
    
    test.async();

    runCode(test, compiler.bytecodes(), 3);
};

exports['compile and run and numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('&', geast.constant(7), geast.constant(4));
    
    compiler.process(constant);
    
    test.async();

    runCode(test, compiler.bytecodes(), 4);
};

exports['compile and run or numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('|', geast.constant(7), geast.constant(4));
    
    compiler.process(constant);
    
    test.async();

    runCode(test, compiler.bytecodes(), 7);
};

exports['compile and run xor numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('^', geast.constant(7), geast.constant(4));
    
    compiler.process(constant);
    
    test.async();

    runCode(test, compiler.bytecodes(), 3);
};

