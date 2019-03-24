
const bc = require('../lib/bc');

exports['compile stop'] = function (test) {
    const result = bc.compiler()
        .stop()
        .bytecodes();
        
    test.equal(result, '00');
};

exports['compile add, mul, sub, div'] = function (test) {
    const result = bc.compiler()
        .add()
        .mul()
        .sub()
        .div()
        .bytecodes();
        
    test.equal(result, '01020304');
};

exports['compile sdiv, mod, smod, addmod, mulmod'] = function (test) {
    const result = bc.compiler()
        .sdiv()
        .mod()
        .smod()
        .addmod()
        .mulmod()
        .bytecodes();
        
    test.equal(result, '0506070809');
};
