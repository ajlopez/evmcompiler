
const compilers = require('../lib/compilers');
const keccak = require('../lib/sha3').keccak_256;
const geast = require('geast');
const VM = require('ethereumjs-vm');

geast.node('method', [ 'name', 'type', 'visibility', 'arguments', 'body' ]);
geast.node('contract', [ 'name', 'body' ]);

exports['run contract with empty method'] = function (test) {
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

exports['run contract with variable declaration and method returning variable'] = function (test) {
    const compiler = compilers.compiler();
    
    const node = geast.contract('Counter',
        geast.sequence([
            geast.variable('counter', 'uint'),
            geast.method('getCounter', 'uint', 'public', [], 
                geast.sequence([
                    geast.return(geast.name('counter'))
                ])
            )
        ]));
        
    compiler.process(node);

    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');
    const data = Buffer.from(keccak("getCounter()").substring(0, 8), 'hex');

    test.async();
    
    vm.runCode({ code: bytes, data: data, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.return);
        test.equal(data.return.length, 32);
        test.equal(parseInt(data.return.toString('hex'), 16), 0);
        test.done();
    });
}

exports['process contract with variable declaration and method modifying variable'] = function (test) {
    const compiler = compilers.compiler();
    
    const node = geast.contract('Counter',
        geast.sequence([
            geast.variable('counter', 'uint'),
            geast.method('getCounter', 'uint', 'public', [], 
                geast.sequence([
                    geast.return(geast.name('counter'))
                ])
            ),
            geast.method('increment', 'void', 'public', [], 
                geast.sequence([
                    geast.assign(
                        geast.name('counter'), 
                        geast.binary('+', geast.name('counter'), geast.constant(1))
                    )
                ])
            )
        ]));
        
    compiler.process(node);
    
    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');
    const data = Buffer.from(keccak("increment()").substring(0, 8), 'hex');

    test.async();
    
    vm.runCode({ code: bytes, data: data, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.return);
        test.equal(data.return.length, 0);
        
        const data2 = Buffer.from(keccak("getCounter()").substring(0, 8), 'hex');

        vm.runCode({ code: bytes, data: data2, gasLimit: 30000000 }, function (err, data) {
            test.ok(!err);
            test.ok(data);
            test.ok(data.return);
            test.equal(data.return.length, 32);
            test.equal(parseInt(data.return.toString('hex'), 16), 1);
            test.done();
        });
    });    
}

exports['process contract with variable declaration and two methods modifying variable'] = function (test) {
    const compiler = compilers.compiler();
    
    const node = geast.contract('Counter',
        geast.sequence([
            geast.variable('counter', 'uint'),
            geast.method('getCounter', 'uint', 'public', [], 
                geast.sequence([
                    geast.return(geast.name('counter'))
                ])
            ),
            geast.method('increment', 'void', 'public', [], 
                geast.sequence([
                    geast.assign(
                        geast.name('counter'), 
                        geast.binary('+', geast.name('counter'), geast.constant(1))
                    )
                ])
            ),
            geast.method('add', 'void', 'public', [ geast.argument('value', 'uint') ], 
                geast.sequence([
                    geast.assign(
                        geast.name('counter'), 
                        geast.binary('+', geast.name('counter'), geast.name('value'))
                    )
                ])
            )
        ]));
        
    compiler.process(node);
    
    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');
    const data = Buffer.from(keccak("increment()").substring(0, 8), 'hex');

    test.async();
    
    vm.runCode({ code: bytes, data: data, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.return);
        test.equal(data.return.length, 0);
        
        const data2 = Buffer.from(keccak("getCounter()").substring(0, 8), 'hex');

        vm.runCode({ code: bytes, data: data2, gasLimit: 30000000 }, function (err, data) {
            test.ok(!err);
            test.ok(data);
            test.ok(data.return);
            test.equal(data.return.length, 32);
            test.equal(parseInt(data.return.toString('hex'), 16), 1);

            const data3 = Buffer.from(keccak("add(uint256)").substring(0, 8) + '0000000000000000000000000000000000000000000000000000000000000029', 'hex');

            vm.runCode({ code: bytes, data: data3, gasLimit: 30000000 }, function (err, data) {
                console.log(err);
                test.ok(!err);
                test.ok(data);
                test.ok(data.return);
                test.equal(data.return.length, 0);

                vm.runCode({ code: bytes, data: data2, gasLimit: 30000000 }, function (err, data) {
                    test.ok(!err);
                    test.ok(data);
                    test.ok(data.return);
                    test.equal(data.return.length, 32);
                    test.equal(parseInt(data.return.toString('hex'), 16), 42);

                    test.done();
                });
            });
        });
    });    
}
