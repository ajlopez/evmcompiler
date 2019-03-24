
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

exports['compile exp, signextend'] = function (test) {
    const result = bc.compiler()
        .exp()
        .signextend()
        .bytecodes();
        
    test.equal(result, '0a0b');
};

exports['compile lt, gt, slt, sgt'] = function (test) {
    const result = bc.compiler()
        .lt()
        .gt()
        .slt()
        .sgt()
        .bytecodes();
        
    test.equal(result, '10111213');
};

exports['compile eq, iszero, and, or, xor, not'] = function (test) {
    const result = bc.compiler()
        .eq()
        .iszero()
        .and()
        .or()
        .xor()
        .not()
        .bytecodes();
        
    test.equal(result, '141516171819');
};
