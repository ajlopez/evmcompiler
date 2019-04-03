
const compilers = require('../lib/compilers');
const keccak = require('../lib/sha3').keccak_256;
const contexts = require('../lib/contexts');
const geast = require('geast');
const VM = require('ethereumjs-vm');

geast.node('method', [ 'name', 'type', 'visibility', 'arguments', 'body' ]);

exports['run conditional command'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.conditional(
        geast.constant(1),
        geast.return(geast.constant(42)),
        geast.return(geast.constant(1))
    );
    
    compiler.process(node);
    
    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');

    test.async();
    
    vm.runCode({ code: bytes, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.return);
        test.equal(data.return.length, 32);
        test.equal(parseInt(data.return.toString('hex'), 16), 42);
        test.done();
    });
};

exports['run else command in conditional command'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.conditional(
        geast.constant(0),
        geast.return(geast.constant(42)),
        geast.return(geast.constant(1))
    );
    
    compiler.process(node);
    
    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');

    test.async();
    
    vm.runCode({ code: bytes, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.return);
        test.equal(data.return.length, 32);
        test.equal(parseInt(data.return.toString('hex'), 16), 1);
        test.done();
    });
};

exports['run conditional command without else command'] = function (test) {
    const compiler = compilers.compiler();
    const node = geast.conditional(
        geast.constant(1),
        geast.return(geast.constant(42))
    );
    
    compiler.process(node);
    
    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');

    test.async();
    
    vm.runCode({ code: bytes, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.return);
        test.equal(data.return.length, 32);
        test.equal(parseInt(data.return.toString('hex'), 16), 42);
        test.done();
    });
};

exports['run loop command using local variable'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.context(contexts.context('method'));
    compiler.enterfn(0);
    
    const node = geast.method(
        'foo',
        'void',
        'public',
        [],
        geast.sequence([
            geast.variable('k', 'uint'),
            geast.loop(
                geast.binary('<', geast.name('k'), geast.constant(42)),
                geast.assign(
                    geast.name('k'),
                    geast.binary('+', geast.name('k'), geast.constant(1))
                )
            ),
            geast.return(geast.name('k'))
        ])
    );
    
    compiler.process(node);
    
    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');

    test.async();
    
    vm.runCode({ code: bytes, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.return);
        test.equal(data.return.length, 32);
        test.equal(parseInt(data.return.toString('hex'), 16), 42);
        test.done();
    });
};

exports['run loop command with break'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.context(contexts.context('method'));
    compiler.enterfn(0);
    
    const node = geast.method(
        'foo',
        'void',
        'public',
        [],
        geast.sequence([
            geast.variable('k', 'uint'),
            geast.loop(
                geast.binary('<', geast.name('k'), geast.constant(42)),
                geast.break()
            ),
            geast.return(geast.name('k'))
        ])
    );
    
    compiler.process(node);
    
    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');

    test.async();
    
    vm.runCode({ code: bytes, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.return);
        test.equal(data.return.length, 32);
        test.equal(parseInt(data.return.toString('hex'), 16), 0);
        test.done();
    });
};

exports['run loop command with continue'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.context(contexts.context('method'));
    compiler.enterfn(0);
    
    const node = geast.method(
        'foo',
        'void',
        'public',
        [],
        geast.sequence([
            geast.variable('k', 'uint'),
            geast.loop(
                geast.binary('<', geast.name('k'), geast.constant(42)),
                geast.sequence([
                    geast.assign(
                        geast.name('k'),
                        geast.constant(100)
                    ),
                    geast.continue()
                ])
            ),
            geast.return(geast.name('k'))
        ])
    );
    
    compiler.process(node);
    
    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');

    test.async();
    
    vm.runCode({ code: bytes, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.return);
        test.equal(data.return.length, 32);
        test.equal(parseInt(data.return.toString('hex'), 16), 100);
        test.done();
    });
};

exports['run for command'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.context(contexts.context('method'));
    compiler.enterfn(0);
    
    const node = geast.method(
        'foo',
        'void',
        'public',
        [],
        geast.sequence([
            geast.variable('k', 'uint'),
            geast.variable('total', 'uint'),
            geast.for(
                geast.assign(geast.name('k'), geast.constant(1)),
                geast.binary('<', geast.name('k'), geast.constant(4)),
                geast.assign(
                    geast.name('k'),
                    geast.binary('+', geast.name('k'), geast.constant(1))
                ),
                geast.assign(
                    geast.name('total'),
                    geast.binary('+', geast.name('total'), geast.name('k'))
                )
            ),
            geast.return(geast.name('total'))
        ])
    );
    
    compiler.process(node);
    
    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');

    test.async();
    
    vm.runCode({ code: bytes, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.return);
        test.equal(data.return.length, 32);
        test.equal(parseInt(data.return.toString('hex'), 16), 6);
        test.done();
    });
};

exports['run for command with break'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.context(contexts.context('method'));
    compiler.enterfn(0);
    
    const node = geast.method(
        'foo',
        'void',
        'public',
        [],
        geast.sequence([
            geast.variable('k', 'uint'),
            geast.variable('total', 'uint'),
            geast.for(
                geast.assign(geast.name('k'), geast.constant(1)),
                geast.binary('<', geast.name('k'), geast.constant(4)),
                geast.assign(
                    geast.name('k'),
                    geast.binary('+', geast.name('k'), geast.constant(1))
                ),
                geast.sequence([
                    geast.assign(
                        geast.name('total'),
                        geast.binary('+', geast.name('total'), geast.name('k'))
                    ),
                    geast.break()
                ])
            ),
            geast.return(geast.name('total'))
        ])
    );
    
    compiler.process(node);
    
    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');

    test.async();
    
    vm.runCode({ code: bytes, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.return);
        test.equal(data.return.length, 32);
        test.equal(parseInt(data.return.toString('hex'), 16), 1);
        test.done();
    });
};

exports['run for command without pre'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.context(contexts.context('method'));
    compiler.enterfn(0);
    
    const node = geast.method(
        'foo',
        'void',
        'public',
        [],
        geast.sequence([
            geast.variable('k', 'uint'),
            geast.variable('total', 'uint'),
            geast.for(
                null,
                geast.binary('<', geast.name('k'), geast.constant(4)),
                geast.assign(
                    geast.name('k'),
                    geast.binary('+', geast.name('k'), geast.constant(1))
                ),
                geast.assign(
                    geast.name('total'),
                    geast.binary('+', geast.name('total'), geast.name('k'))
                )
            ),
            geast.return(geast.name('total'))
        ])
    );
    
    compiler.process(node);
    
    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');

    test.async();
    
    vm.runCode({ code: bytes, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.return);
        test.equal(data.return.length, 32);
        test.equal(parseInt(data.return.toString('hex'), 16), 6);
        test.done();
    });
};

exports['run for command without pre and post'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.context(contexts.context('method'));
    compiler.enterfn(0);
    
    const node = geast.method(
        'foo',
        'void',
        'public',
        [],
        geast.sequence([
            geast.variable('k', 'uint'),
            geast.variable('total', 'uint'),
            geast.for(
                null,
                geast.binary('<', geast.name('k'), geast.constant(4)),
                null,
                geast.sequence([
                    geast.assign(
                        geast.name('total'),
                        geast.binary('+', geast.name('total'), geast.name('k'))
                    ),
                    geast.assign(
                        geast.name('k'),
                        geast.binary('+', geast.name('k'), geast.constant(1))
                    )
                ])
            ),
            geast.return(geast.name('total'))
        ])
    );
    
    compiler.process(node);
    
    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');

    test.async();
    
    vm.runCode({ code: bytes, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.return);
        test.equal(data.return.length, 32);
        test.equal(parseInt(data.return.toString('hex'), 16), 6);
        test.done();
    });
};

exports['run for command with continue'] = function (test) {
    const compiler = compilers.compiler();
    
    compiler.context(contexts.context('method'));
    compiler.enterfn(0);
    
    const node = geast.method(
        'foo',
        'void',
        'public',
        [],
        geast.sequence([
            geast.variable('k', 'uint'),
            geast.variable('total', 'uint'),
            geast.for(
                null,
                geast.binary('<', geast.name('k'), geast.constant(4)),
                null,
                geast.sequence([
                    geast.assign(
                        geast.name('total'),
                        geast.binary('+', geast.name('total'), geast.name('k'))
                    ),
                    geast.assign(
                        geast.name('k'),
                        geast.binary('+', geast.name('k'), geast.constant(1))
                    ),
                    geast.continue(),
                    geast.assign(
                        geast.name('total'),
                        geast.binary('+', geast.name('total'), geast.name('k'))
                    )
                ])
            ),
            geast.return(geast.name('total'))
        ])
    );
    
    compiler.process(node);
    
    const code = compiler.bytecodes();
    const vm = new VM();
    const bytes = Buffer.from(code, 'hex');

    test.async();
    
    vm.runCode({ code: bytes, gasLimit: 30000000 }, function (err, data) {
        test.ok(!err);
        test.ok(data);
        test.ok(data.return);
        test.equal(data.return.length, 32);
        test.equal(parseInt(data.return.toString('hex'), 16), 6);
        test.done();
    });
};

