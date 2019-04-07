
const compilers = require('../lib/compilers');
const geast = require('geast');

exports['compile add numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('+', geast.constant(42), geast.constant(1));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '6001602a01');
};

exports['compile multiply numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('*', geast.constant(42), geast.constant(1));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '6001602a02');
};

exports['compile subtract numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('-', geast.constant(42), geast.constant(1));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '6001602a03');
};

exports['compile divide numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('/', geast.constant(42), geast.constant(1));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '6001602a04');
};

exports['compile mod numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('%', geast.constant(42), geast.constant(1));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '6001602a06');
};

exports['compile add mod numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('+%', geast.constant(42), geast.constant(1));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '6001602a08');
};

exports['compile multiply mod numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('*%', geast.constant(42), geast.constant(1));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '6001602a09');
};

exports['compile equal numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('==', geast.constant(42), geast.constant(1));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '6001602a14');
};

exports['compile less numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('<', geast.constant(42), geast.constant(1));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '6001602a10');
};

exports['compile greater numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('>', geast.constant(42), geast.constant(1));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '6001602a11');
};

exports['compile and numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('&', geast.constant(42), geast.constant(1));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '6001602a16');
};

exports['compile or numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('|', geast.constant(42), geast.constant(1));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '6001602a17');
};

exports['compile xor numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('^', geast.constant(42), geast.constant(1));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '6001602a18');
};

