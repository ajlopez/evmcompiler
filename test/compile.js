
const evmcompiler = require('..');
const geast = require('geast');

geast.node('contract', [ 'name', 'body' ]);

exports['compile simple contract'] = function (test) {
    const node = geast.contract('Counter',
        geast.sequence([
            geast.method('foo', 'void', 'public', [], geast.sequence([]))
        ]));

    const bytecodes = evmcompiler.compile(node);
    
    test.ok(bytecodes);
    test.equal(typeof bytecodes, 'string');
};