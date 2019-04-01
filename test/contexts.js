
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

