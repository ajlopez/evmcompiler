
const contexts = require('../lib/contexts');

exports['create context as object'] = function (test) {
    const context = contexts.context();
    
    test.ok(context);
    test.equal(typeof context, 'object');
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