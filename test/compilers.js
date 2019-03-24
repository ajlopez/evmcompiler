
const compilers = require('../lib/compilers');

exports['compile load storage'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.loadStorage(1);
    
    test.equal(compiler.bytecodes(), '600155');
};

exports['compile load storage with two bytes offset'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.loadStorage(256);
    
    test.equal(compiler.bytecodes(), '61010055');
};

