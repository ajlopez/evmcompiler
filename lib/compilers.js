
const bc = require('./bc');

function Compiler() {
    const bcc = bc.compiler();
    
    this.value = function (value) {
        bcc.value(value);
    }
    
    this.loadStorage = function (offset) {
        bcc.value(offset);
        bcc.sload();
    };
    
    this.storeStorage = function (offset) {
        bcc.value(offset);
        bcc.sstore();
    };
    
    this.process = function (node) {
        return node.process(this);
    };
    
    this.processConstant = function (node) {
        this.value(node.value());
    };
    
    this.bytecodes = function () { return bcc.bytecodes(); };
}

function createCompiler() {
    return new Compiler();
}

module.exports = {
    compiler: createCompiler
};