
const bc = require('./bc');

function Compiler() {
    const bcc = bc.compiler();
    
    this.loadStorage = function (offset) {
        bcc.value(offset);
        bcc.sstore();
    };
    
    this.bytecodes = function () { return bcc.bytecodes(); };
}

function createCompiler() {
    return new Compiler();
}

module.exports = {
    compiler: createCompiler
};