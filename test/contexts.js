
const contexts = require('../lib/contexts');

exports['create context as object'] = function (test) {
    const context = contexts.context();
    
    test.ok(context);
    test.equal(typeof context, 'object');
    test.equal(context.scope(), 'program');
};

exports['create context with scope'] = function (test) {
    const context = contexts.context('contract');
    
    test.ok(context);
    test.equal(typeof context, 'object');
    test.equal(context.scope(), 'contract');
};

exports['add variable to contract context'] = function (test) {
    const context = contexts.context('contract');

    test.ok(context);
    test.equal(context.nvars(), 0);
    
    context.set('answer', { name: 'answer', type: 'uint' });
    
    test.deepEqual(context.get('answer'), { name: 'answer', type: 'uint', scope: 'contract', offset: 0 });
    test.equal(context.nvars(), 1);
    
    context.set('counter', { name: 'counter', type: 'uint' });
    
    test.deepEqual(context.get('counter'), { name: 'counter', type: 'uint', scope: 'contract', offset: 1 });
    test.equal(context.nvars(), 2);
};

exports['get unknown value'] = function (test) {
    const context = contexts.context();
    
    test.equal(context.get('foo'), null);
};

exports['set and get value'] = function (test) {
    const context = contexts.context();
    
    context.set('answer', 42);
    
    test.equal(context.get('answer'), 42);
};

exports['set and get value in parent context'] = function (test) {
    const parent = contexts.context();
    const context = contexts.context('contract', parent);
    
    parent.set('answer', 42);
    
    test.equal(context.get('answer'), 42);
    test.equal(parent.scope(), 'program');
    test.equal(context.scope(), 'contract');
};

exports['add variables to contract and method'] = function (test) {
    const parent = contexts.context('contract');
    const context = contexts.context('method', parent);
    
    parent.set('counter', { name: 'counter', type: 'uint' });
    context.set('k', { name: 'k', type: 'uint' });
    context.set('j', { name: 'j', type: 'uint' });
    
    test.equal(parent.nvars(), 1);
    test.equal(context.nvars(), 2);
    test.deepEqual(parent.get('counter'), { name: 'counter', type: 'uint', offset: 0, scope: 'contract' });
    test.deepEqual(context.get('k'), { name: 'k', type: 'uint', offset: 0, scope: 'method' });
    test.deepEqual(context.get('j'), { name: 'j', type: 'uint', offset: 1, scope: 'method' });
};

