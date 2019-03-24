
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

exports['compile byte, shl, shr, sar'] = function (test) {
    const result = bc.compiler()
        .byte()
        .shl()
        .shr()
        .sar()
        .bytecodes();
        
    test.equal(result, '1a1b1c1d');
};

exports['compile sha3'] = function (test) {
    const result = bc.compiler()
        .sha3()
        .bytecodes();
        
    test.equal(result, '20');
};

exports['compile address, balance, origin, caller'] = function (test) {
    const result = bc.compiler()
        .address()
        .balance()
        .origin()
        .caller()
        .bytecodes();
        
    test.equal(result, '30313233');
};

exports['compile callvalue, calldataload, calldatasize calldatacopy'] = function (test) {
    const result = bc.compiler()
        .callvalue()
        .calldataload()
        .calldatasize()
        .calldatacopy()
        .bytecodes();
        
    test.equal(result, '34353637');
};

exports['compile codesize, codecopy, returndatasize, returndatacopy'] = function (test) {
    const result = bc.compiler()
        .codesize()
        .codecopy()
        .returndatasize()
        .returndatacopy()
        .bytecodes();
        
    test.equal(result, '38393d3e');
};

exports['compile gasprice, extcodesize, extcodecopy'] = function (test) {
    const result = bc.compiler()
        .gasprice()
        .extcodesize()
        .extcodecopy()
        .bytecodes();
        
    test.equal(result, '3a3b3c');
};

exports['compile blockhash, coinbase, timestamp, number, difficulty, gaslimit'] = function (test) {
    const result = bc.compiler()
        .blockhash()
        .coinbase()
        .timestamp()
        .number()
        .difficulty()
        .gaslimit()
        .bytecodes();
        
    test.equal(result, '404142434445');
};

exports['compile pop, mload, mstore, mstore8, sload, sstore'] = function (test) {
    const result = bc.compiler()
        .pop()
        .mload()
        .mstore()
        .mstore8()
        .sload()
        .sstore()
        .bytecodes();
        
    test.equal(result, '505152535455');
};

exports['compile jump, jumpi, pc, msize, gas, jumpdest'] = function (test) {
    const result = bc.compiler()
        .jump()
        .jumpi()
        .pc()
        .msize()
        .gas()
        .jumpdest()
        .bytecodes();
        
    test.equal(result, '565758595a5b');
};

exports['compile pushes'] = function (test) {
    let result = bc.compiler();
    
    for (let k = 1; k <= 32; k++)
        result.push(k);
    
    result = result.bytecodes();
        
    test.equal(result, '606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f');
};

exports['compile dups'] = function (test) {
    let result = bc.compiler();
    
    for (let k = 1; k <= 16; k++)
        result.dup(k);
    
    result = result.bytecodes();
        
    test.equal(result, '808182838485868788898a8b8c8d8e8f');
};

exports['compile swaps'] = function (test) {
    let result = bc.compiler();
    
    for (let k = 1; k <= 16; k++)
        result.swap(k);
    
    result = result.bytecodes();
        
    test.equal(result, '909192939495969798999a9b9c9d9e9f');
};

