
const compilers = require('../lib/compilers');
const contexts = require('../lib/contexts');

exports['compile one byte value'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.value(1);
    
    test.equal(compiler.bytecodes(), '6001');
};

exports['compile two bytes value'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.value(256);
    
    test.equal(compiler.bytecodes(), '610100');
};

exports['compile three bytes value'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.value(256 * 256);
    
    test.equal(compiler.bytecodes(), '62010000');
};

exports['compile four bytes value'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.value(256 * 256 * 256);
    
    test.equal(compiler.bytecodes(), '6301000000');
};

exports['compile hexa string value'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.value('010203040506');
    
    test.equal(compiler.bytecodes(), '65010203040506');
};

exports['compile hexa string value with odd number of digits'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.value('10203040506');
    
    test.equal(compiler.bytecodes(), '65010203040506');
};

exports['compile hexa string value with hex prefix'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.value('0x10203040506');
    
    test.equal(compiler.bytecodes(), '65010203040506');
};

exports['compile load storage'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.loadStorage(1);
    
    test.equal(compiler.bytecodes(), '600154');
};

exports['compile load storage with two bytes offset'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.loadStorage(256);
    
    test.equal(compiler.bytecodes(), '61010054');
};

exports['compile store storage'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.storeStorage(1);
    
    test.equal(compiler.bytecodes(), '600155');
};

exports['compile store storage with two bytes offset'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.storeStorage(256);
    
    test.equal(compiler.bytecodes(), '61010055');
};

exports['compile load local'] = function (test) {
    const compiler = compilers.compiler();
    compiler.context(contexts.context());
    compiler.enterfn('public', 0);
    compiler.value(1);
    compiler.value(2);
    compiler.value(3);
    compiler.loadLocal(0);
    
    test.equal(compiler.bytecodes(), '60016002600382');
};

exports['compile store local'] = function (test) {
    const compiler = compilers.compiler();
    compiler.context(contexts.context());
    
    compiler.enterfn('public', 0);
    compiler.value(1);
    compiler.value(2);
    compiler.value(3);
    compiler.storeLocal(0);
    
    test.equal(compiler.bytecodes(), '6001600260039150');
};

exports['compile load first data argument'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.loadDataArgument(0);
    
    test.equal(compiler.bytecodes(), '600435');
};

exports['compile load second data argument'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.loadDataArgument(1);
    
    test.equal(compiler.bytecodes(), '602435');
};

