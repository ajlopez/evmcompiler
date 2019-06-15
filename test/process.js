
const compilers = require('../lib/compilers');
const contexts = require('../lib/contexts');
const geast = require('geast');

geast.node('origin', []);
geast.node('caller', []);
geast.node('gas', []);
geast.node('gasprice', []);
geast.node('value', []);

function process(test, op, expected) {
    const compiler = compilers.compiler();
    const context = contexts.context();
    context.scope('method');
    context.fn({ arity: 0 });
    compiler.context(context);
    const node = geast[op]();
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), expected);
}

exports['process origin'] = function (test) {
    process(test, 'origin', '32');
};

exports['process caller'] = function (test) {
    process(test, 'caller', '33');
};

exports['process value'] = function (test) {
    process(test, 'value', '34');
};

exports['process return without expression'] = function (test) {
    process(test, 'return', '00');
};

exports['process return with expression'] = function (test) {
    const compiler = compilers.compiler();
    const context = contexts.context();
    context.scope('method');
    context.fn({ arity: 0 });
    compiler.context(context);
    const node = geast.return(geast.constant(42));
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "602a60005260206000f3");
};

exports['process eval with expression'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.eval(geast.constant(42));
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "602a50");
};

exports['process integer constant'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.constant(42);
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "602a");
};

exports['process add unsigned integer constants'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.binary('+', geast.constant(42, 'uint'), geast.constant(1, 'uint'));
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "6001602a01");
};

exports['process divide unsigned integer constants'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.binary('/', geast.constant(42, 'uint'), geast.constant(2, 'uint'));
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "6002602a04");
};

exports['process divide signed integer constants'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.binary('/', geast.constant(42, 'int'), geast.constant(2, 'int'));
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "6002602a05");
};

exports['process mod unsigned integer constants'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.binary('%', geast.constant(42, 'uint'), geast.constant(2, 'uint'));
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "6002602a06");
};

exports['process mod signed integer constants'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.binary('%', geast.constant(42, 'int'), geast.constant(2, 'int'));
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "6002602a07");
};

exports['process boolean false constant'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.constant(false);
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "6000");
};

exports['process boolean true constant'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.constant(true);
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "6001");
};

exports['process call'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.call(geast.name('foo'), [ geast.constant(42) ]);
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "610009602a61____565b");
};

exports['process storage variable'] = function (test) {
    const compiler = compilers.compiler();
    const context = contexts.context();
    context.set('foo', { name: 'foo', type: 'uint', offset: 10, scope: 'contract' });
    compiler.context(context);
    
    const node = geast.name('foo');
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "600a54");
};

exports['process indexed storage variable'] = function (test) {
    const compiler = compilers.compiler();
    const context = contexts.context();
    context.set('foo', { name: 'foo', type: 'uint', offset: 10, scope: 'contract' });
    compiler.context(context);
    
    const node = geast.indexed(geast.name('foo'), geast.constant(2));
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "600a60020154");
};

exports['process local variable'] = function (test) {
    const compiler = compilers.compiler();
    const context = contexts.context();
    context.set('foo', { name: 'foo', type: 'uint', offset: 1, scope: 'method' });
    context.fn({ arity: 0, ssize: -3 });
    compiler.context(context);
    
    const node = geast.name('foo');
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "81");
};
