
const compilers = require('../lib/compilers');
const keccak = require('../lib/sha3').keccak_256;
const geast = require('geast');
const VM = require('ethereumjs-vm');

geast.node('contract', [ 'name', 'body' ]);
geast.node('function', [ 'name', 'type', 'arguments', 'body', 'attributes' ]);

exports['run contract with empty function'] = function (test) {
    const compiler = compilers.compiler();
    
    const node = geast.contract('Counter',
        geast.sequence([
            geast.function('foo', 'void', [], geast.sequence([]), { visibility: 'public' })
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

exports['run contract with variable declaration and function returning variable'] = function (test) {
    const compiler = compilers.compiler();
    
    const node = geast.contract('Counter',
        geast.sequence([
            geast.variable('counter', 'uint'),
            geast.function('getCounter', 'uint', [], 
                geast.sequence([
                    geast.return(geast.name('counter'))
                ]), 
                { visibility: 'public' }
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

exports['process contract with variable declaration and function modifying variable'] = function (test) {
    const compiler = compilers.compiler();
    
    const node = geast.contract('Counter',
        geast.sequence([
            geast.variable('counter', 'uint'),
            geast.function('getCounter', 'uint', [], 
                geast.sequence([
                    geast.return(geast.name('counter'))
                ]),
                { visibility: 'public' }
            ),
            geast.function('increment', 'void', [], 
                geast.sequence([
                    geast.assign(
                        geast.name('counter'), 
                        geast.binary('+', geast.name('counter'), geast.constant(1))
                    )
                ]),
                { visibility: 'public' }
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

exports['process contract with variable declaration and two functions modifying variable'] = function (test) {
    const compiler = compilers.compiler();
    
    const node = geast.contract('Counter',
        geast.sequence([
            geast.variable('counter', 'uint'),
            geast.function('getCounter', 'uint', [], 
                geast.sequence([
                    geast.return(geast.name('counter'))
                ]),
                { visibility: 'public' }
            ),
            geast.function('increment', 'void', [], 
                geast.sequence([
                    geast.assign(
                        geast.name('counter'), 
                        geast.binary('+', geast.name('counter'), geast.constant(1))
                    )
                ]),
                { visibility: 'public' }
            ),
            geast.function('add', 'void', [ geast.argument('value', 'uint') ], 
                geast.sequence([
                    geast.assign(
                        geast.name('counter'), 
                        geast.binary('+', geast.name('counter'), geast.name('value'))
                    )
                ]),
                { visibility: 'public' }
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
