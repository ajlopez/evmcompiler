
const compilers = require('../lib/compilers');
const geast = require('geast');

exports['compile not number'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.unary('!', geast.constant(42));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '602a19');
};

exports['compile logic not'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.unary('!!', geast.constant(true));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '600161000c57600161000f565b60005b');
};


