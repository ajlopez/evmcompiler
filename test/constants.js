
const compilers = require('../lib/compilers');
const geast = require('geast');

exports['compile constant'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.constant(42);
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '602a');
};

exports['compile two byte constant'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.constant(256);
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '610100');
};

