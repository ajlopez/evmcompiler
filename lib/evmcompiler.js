
const compilers = require('./compilers');
const bc = require('./bc');

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
    bcc.value(10);
    bcc.value(0);
    bcc.codecopy();
    bcc.value(0);
    bcc.return();
    
    return bcc.bytecodes() + bytecodes;
}

module.exports = {
    compile: compileAST
};