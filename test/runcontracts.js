
const compilers = require('../lib/compilers');
const keccak = require('../lib/sha3').keccak_256;
const geast = require('geast');
const VM = require('ethereumjs-vm');

geast.node('method', [ 'name', 'type', 'visibility', 'arguments', 'body' ]);
geast.node('contract', [ 'name', 'body' ]);

exports['process contract with empty method'] = function (test) {
    const compiler = compilers.compiler();
    
    const node = geast.contract('Counter',
        geast.sequence([
            geast.method('foo', 'void', 'public', [], geast.sequence([]))
        ]));
        
    compiler.process(node);

    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');
    const data = Buffer.from(keccak("foo()").substring(0, 8), 'hex');

    test.async();
    
    vm.runCode({ code: bytes, data: data, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.return);
        test.equal(data.return.length, 0);
        test.done();
    });
}
