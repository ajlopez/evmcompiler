
const bc = require('./bc');

const binaries = {
    '+': 'add',
    '*': 'mul'
};

function Compiler() {
    const bcc = bc.compiler();
    const fns = [];
    let fn = null;
    
    this.enterfn = function (arity) {
        if (fn)
            fns.push(fn);
        
        fn = { arity: arity, ssize: bcc.ssize() };
    };
    
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
    
    this.loadLocal = function (offset) {
        const ssize = bcc.ssize();
        const pos = fn.ssize + offset;
        
        bcc.dup(ssize - pos);
    }
    
    this.storeLocal = function (offset) {
        const ssize = bcc.ssize();
        const pos = fn.ssize + offset;
        
        bcc.swap(ssize - pos - 1);
        bcc.pop();
    }
    
    this.process = function (node) {
        return node.process(this);
    };
    
    this.processConstant = function (node) {
        this.value(node.value());
    };
    
    this.processOrigin = function (node) {
        bcc.origin();
    };
    
    this.processCaller = function (node) {
        bcc.caller();
    };
    
    this.processValue = function (node) {
        bcc.callvalue();
    };
    
    this.processBinary = function (node) {
        this.process(node.left());
        this.process(node.right());
        
        bcc[binaries[node.operator()]]();
    }
    
    this.bytecodes = function () { return bcc.bytecodes(); };
}

function createCompiler() {
    return new Compiler();
}

module.exports = {
    compiler: createCompiler
};