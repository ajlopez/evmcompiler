
const compilers = require('../lib/compilers');
const geast = require('geast');

geast.node('origin', []);
geast.node('caller', []);
geast.node('gas', []);
geast.node('gasprice', []);
geast.node('value', []);

function process(test, op, expected) {
    const compiler = compilers.compiler();
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
