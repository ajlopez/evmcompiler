
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

function compileRunCode(test, node, expected) {
    const compiler = compilers.compiler();
    compiler.process(node);
    runCode(test, compiler.bytecodes(), expected);
}

exports['compile and run logical not'] = function (test) {
    compileRunCode(test, geast.unary('!!', geast.constant(true)), 0);
    compileRunCode(test, geast.unary('!!', geast.constant(false)), 1);
    compileRunCode(test, geast.unary('!!', geast.constant(42)), 0);
    compileRunCode(test, geast.unary('!!', geast.constant(0)), 1);
};

