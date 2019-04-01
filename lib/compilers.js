
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

function getMethodSignature(node) {
    let result = node.name() + '(';
    let args = node.arguments();
    
    for (let k = 0, l = args.length; k < l; k++) {
        if (k)
            result += ',';
        
        result += normalizeType(args[k].type());
    }
        
    return result + ')';
}

function Compiler() {
    const bcc = bc.compiler();
    let fn = null;
    let context = null;
    let scope = null;
    let fnnames = null;
    let storageoffset = 0;
    
    this.context = function () {
        return context;
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
    
    this.enterfn = function (arity) {
        fn = { ssize: bcc.ssize(), arity: arity };
    }
    
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
    
    function generateMethodCall(methodname) {
        const method = context.get(methodname);
        
        bcc.dup(1);
        bcc.value(method.hash);
        bcc.eq();
        bcc.offset(methodname);
        bcc.jumpi();
    }
    
    function generateContractPrologue() {
        bcc.calldatasize();
        bcc.value(4);
        bcc.lt();
        bcc.offset('revert0');
        bcc.jumpi();

        bcc.value(0);
        bcc.calldataload();
        bcc.value('0x100000000000000000000000000000000000000000000000000000000');
        bcc.swap(1);
        bcc.div();
        bcc.value('0xffffffff');
        bcc.and();
        
        for (let k = 0, l = fnnames.length; k < l; k++)
            generateMethodCall(fnnames[k]);
        
        bcc.label('revert0');
        bcc.revert();
    }
    
    this.processContract = function (node) {
        context = contexts.context();
        scope = 'contract';
        fnnames = [];
        storageoffset = 0;
        
        const nodes = node.body().nodes();
        
        for (let k = 0, l = nodes.length; k < l; k++) {
            const node = nodes[k];
            const ntype = node.ntype();
            
            if (ntype === 'variable')
                this.preprocessVariable(node);
            else if (ntype === 'method')
                this.preprocessMethod(node);
        }
        
        generateContractPrologue();
            
        node.body().process(this);
    };
    
    this.processSequence = function (node) {
        const nodes = node.nodes();
        
        for (let k = 0, l = nodes.length; k < l; k++)
            nodes[k].process(this);
    };
    
    this.preprocessMethod = function (node) {
        const fnname = getMethodSignature(node);
        
        const fn = {
            signature: fnname,
            hash: keccak(fnname).substring(0, 8)
        };
        
        context.set(fnname, fn);
        fnnames.push(fnname);
    };
    
    this.processMethod = function (node) {
        const methodname = getMethodSignature(node);
        const args = node.arguments();
        this.enterfn(args.length);
        
        bcc.label(methodname);
        
        const originalContext = context;
        context = contexts.context(originalContext);
        
        const originalScope = scope;
        scope = 'method';
        
        for (let k = 0, l = args.length; k < l; k++)
            context.set(args[k].name(), {
                scope: 'argument',
                type: args[k].type(),
                offset: k
            });
        
        node.body().process(this);
        
        if (node.type() === 'void') {
            bcc.value(0);
            bcc.value(0);
            bcc.return();
        }
        
        context = originalContext;
        scope = originalScope;
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
    
    this.preprocessVariable = function (node) {
        const name = node.name();
        const type = normalizeType(node.type());
        
        context.set(name, { 
            scope: 'contract', 
            type: type,
            offset: storageoffset++
        });
    };
    
    this.processVariable = function (node) {
    };
    
    this.processName = function (node) {
        const varname = node.name();
        const vardef = context.get(varname);
      
        if (vardef.scope === 'contract') {
            bcc.value(vardef.offset);
            bcc.sload();
        }
        else if (vardef.scope === 'argument')
            this.loadDataArgument(vardef.offset);
    };
    
    this.processAssignment = function (node) {
        node.value().process(this);
        
        const varname = node.lefthand().name();
        const vardef = context.get(varname);
        bcc.value(vardef.offset);
        bcc.sstore();
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
        this.process(node.right());
        this.process(node.left());
        
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