
const bc = require('./bc');
const keccak = require('./sha3').keccak_256;
const contexts = require('./contexts');

const binaries = {
    '+': 'add',
    '-': 'sub',
    '*': 'mul',
    '/': 'div',
    '==': 'eq',
    '<': 'lt',
    '>': 'gt'
};

function normalizeType(type) {
    if (type === 'uint')
        return 'uint256';
    
    return type;
}

function Compiler() {
    const bcc = bc.compiler();
    const fns = [];
    let fn = null;
    let context = null;
    
    this.fns = function () {
        return fns;
    };
    
    this.context = function () {
        return context;
    };
    
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
    
    this.loadDataArgument = function (offset) {
        bcc.value(offset * 32 + 4);
        bcc.calldataload();
    };
    
    this.processContract = function (node) {
        context = contexts.context();
        node.body().process(this);
    };
    
    this.processSequence = function (node) {
        const nodes = node.nodes();
        
        for (let k = 0, l = nodes.length; k < l; k++)
            nodes[k].process(this);
    };
    
    this.processMethod = function (node) {
        bcc.jumpdest();
        const fnname = node.name() + "()";
        const fn = {
            signature: fnname,
            hash: keccak(fnname).substring(0, 8)
        };
        fns.push(fn);
        node.body().process(this);
    };
    
    this.processReturn = function (node) {
        const expression = node.expression();
        
        if (expression == null) {
            this.value(0);
            this.value(0);
            bcc.return();
            
            return;
        }
        
        expression.process(this);
        this.value(0);
        bcc.mstore();
        
        this.value(32);
        this.value(0);
        
        bcc.return();
    };
    
    this.processConstant = function (node) {
        this.value(node.value());
    };
    
    this.processVariable = function (node) {
        const name = node.name();
        const type = normalizeType(node.type());
        
        context.set(name, { scope: 'contract', type: type });
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
    
    this.process = function (node) {
        return node.process(this);
    };
    
    this.bytecodes = function () { return bcc.bytecodes(); };
}

function createCompiler() {
    return new Compiler();
}

module.exports = {
    compiler: createCompiler
};