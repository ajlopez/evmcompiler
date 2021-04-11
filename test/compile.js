
const evmcompiler = require('..');
const geast = require('geast');

geast.node('contract', [ 'name', 'body' ]);
geast.node('function', [ 'name', 'type', 'arguments', 'body', 'attributes' ]);

exports['compile simple contract'] = function (test) {
    const node = geast.contract('Counter',
        geast.sequence([
            geast.function('foo', 'void', [], geast.sequence([]), { visibility: 'public' })
        ]));

    const bytecodes = evmcompiler.compile(node);
    
    test.ok(bytecodes);
    test.equal(typeof bytecodes, 'string');
};