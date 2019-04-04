
const compilers = require('./compilers');
const bc = require('./bc');
const keccak = require('./sha3').keccak_256;

function compileAST(ast) {
    const compiler = compilers.compiler();
    compiler.process(ast);
    const bytecodes = compiler.bytecodes();
    
    const bcc = bc.compiler();
    
    let lconstructor = 11;
    
    if (bytecodes.length / 2 >= 256)
        lconstructor++;
   
    bcc.value(bytecodes.length / 2);
    bcc.dup(1);
    bcc.value(lconstructor);
    bcc.value(0);
    bcc.codecopy();
    bcc.value(0);
    bcc.return();
    
    return bcc.bytecodes() + bytecodes;
}

function functionHash(signature) {
    return keccak(signature).substring(0, 8);
}

module.exports = {
    compile: compileAST,
    fnhash: functionHash
};