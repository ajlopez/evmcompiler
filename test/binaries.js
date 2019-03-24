
const compilers = require('../lib/compilers');
const geast = require('geast');

exports['compile add numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('+', geast.constant(42), geast.constant(1));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '602a600101');
};

exports['compile multiply numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('*', geast.constant(42), geast.constant(1));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '602a600102');
};

exports['compile subtract numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('-', geast.constant(42), geast.constant(1));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '602a600103');
};

exports['compile divide numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('/', geast.constant(42), geast.constant(1));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '602a600104');
};

exports['compile equal numbers'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.binary('==', geast.constant(42), geast.constant(1));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '602a600114');
};
