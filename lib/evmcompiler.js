
const compilers = require('./compilers');

function compileAST(ast) {
    const compiler = compilers.compiler();
    compiler.process(ast);
    return compiler.bytecodes();
}

module.exports = {
    compile: compileAST
};