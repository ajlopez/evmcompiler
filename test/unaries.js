
const compilers = require('../lib/compilers');
const geast = require('geast');

exports['compile not number'] = function (test) {
    const compiler = compilers.compiler();
    const constant = geast.unary('!', geast.constant(42));
    
    compiler.process(constant);
    
    test.equal(compiler.bytecodes(), '602a19');
};
