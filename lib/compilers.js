
const bc = require('./bc');
const keccak = require('./sha3').keccak_256;
const contexts = require('./contexts');

const unaries = {
    '!': 'not'
};

const binaries = {
    '+': 'add',
    '-': 'sub',
    '*': 'mul',
    '/': 'div',
    '%': 'mod',
    '+%': 'addmod',
    '*%': 'mulmod',
    '==': 'eq',
    '<': 'lt',
    '>': 'gt',
    '&': 'and',
    '|': 'or',
    '^': 'xor',
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
    let fnnames = null;
    let nlabels = 0;
    
    let breaklabels = [];
    let continuelabels = [];
    
    this.context = function (newcontext) {
        if (newcontext)
            context = newcontext;
        else
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
        bcc.value(4);
        bcc.calldatasize();
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
        context = contexts.context('contract');
        fnnames = [];
        
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
        context = contexts.context('method', originalContext);
        
        for (let k = 0, l = args.length; k < l; k++)
            context.set(args[k].name(), {
                scope: 'argument',
                type: args[k].type(),
                offset: k
            });

        const nodes = node.body().nodes();
        
        for (let k = 0, l = nodes.length; k < l; k++) {
            const node = nodes[k];
            const ntype = node.ntype();
            
            if (ntype === 'variable')
                this.preprocessVariable(node);
        }
        
        node.body().process(this);
        
        if (node.type() === 'void') {
            bcc.stop();
        }
        
        context = originalContext;
    };
    
    function generateLabel() {
        return 'label' + nlabels++;
    }
    
    this.processConditional = function (node) {
        const elselabel = generateLabel();
        const endlabel = generateLabel();
        const elsecmd = node.else();
        
        node.condition().process(this);
        bcc.value(0);
        bcc.eq();
        
        if (elsecmd)
            bcc.offset(elselabel);
        else
            bcc.offset(endlabel);
        
        bcc.jumpi();
        
        node.then().process(this);
        bcc.offset(endlabel);
        bcc.jump();

        if (elsecmd) {
            bcc.label(elselabel);
            elsecmd.process(this);
        }
        
        bcc.label(endlabel);
    };
    
    this.processBreak = function (node) {
        bcc.offset(breaklabels[0]);
        bcc.jump();
    };
    
    this.processContinue = function (node) {
        bcc.offset(continuelabels[0]);
        bcc.jump();
    };
    
    this.processLoop = function (node) {
        const beginlabel = 'label' + nlabels++;
        const endlabel = 'label' + nlabels++;
        
        breaklabels.unshift(endlabel);
        continuelabels.unshift(beginlabel);
        
        bcc.label(beginlabel);
        
        node.condition().process(this);
        bcc.value(0);
        bcc.eq();
        bcc.offset(endlabel);
        bcc.jumpi();
        
        node.body().process(this);
        
        bcc.offset(beginlabel);
        bcc.jump();
        
        bcc.label(endlabel);
        
        breaklabels.shift();
        continuelabels.shift();
    };
    
    this.processFor = function (node) {
        const beginlabel = 'label' + nlabels++;
        const postlabel = 'label' + nlabels++;
        const endlabel = 'label' + nlabels++;
        
        const pre = node.pre();
        const pro = node.post();
        const post = node.post();
        
        breaklabels.unshift(endlabel);
        continuelabels.unshift(postlabel);
        
        if (pre)
            pre.process(this);
        
        bcc.label(beginlabel);
        
        node.condition().process(this);
        bcc.value(0);
        bcc.eq();
        bcc.offset(endlabel);
        bcc.jumpi();
        
        node.body().process(this);
        
        bcc.label(postlabel);
        
        if (post)
            post.process(this);
        
        bcc.offset(beginlabel);
        bcc.jump();
        
        bcc.label(endlabel);
        
        breaklabels.shift();
        continuelabels.shift();
    };
    
    function removeLocalVariables(nvars) {
        while (nvars > 0) {
            bcc.pop();
            nvars--;
        }
    }
    
    this.processReturn = function (node) {
        const expression = node.expression();
        
        if (expression == null) {
            removeLocalVariables(context.nvars());
            
            bcc.stop();
            
            return;
        }
        
        expression.process(this);
        this.value(0);
        bcc.mstore();

        removeLocalVariables(context.nvars());
        
        this.value(32);
        this.value(0);
        
        bcc.return();
    };
    
    this.processConstant = function (node) {
        const value = node.value();
        
        if (value === false)
            this.value(0);
        else if (value === true)
            this.value(1);
        else
            this.value(value);
    };
    
    this.processEval = function (node) {
        node.expression().process(this);
        bcc.pop();
    };
    
    this.preprocessVariable = function (node) {
        const name = node.name();
        const type = normalizeType(node.type());
        
        context.set(name, { 
            name: name,
            type: type
        });
        
        if (context.scope() === 'method')
            bcc.value(0);
    };
    
    this.processVariable = function (node) {
        if (context.scope() !== 'method')
            return;
        
        const name = node.name();
        const vardef = context.get(name);
        const expr = node.expression();
        
        if (expr) {
            expr.process(this);
            this.storeLocal(vardef.offset);
        }
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
        else if (vardef.scope === 'method')
            this.loadLocal(vardef.offset);
    };
    
    this.processAssign = function (node) {
        node.expression().process(this);
        
        const varname = node.lefthand().name();
        const vardef = context.get(varname);
        
        if (vardef.scope === 'contract') {
            bcc.value(vardef.offset);
            bcc.sstore();
        }
        else if (vardef.scope === 'method')
            this.storeLocal(vardef.offset);
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
    
    this.processUnary = function (node) {
        this.process(node.expression());
        
        const oper = node.operator();
        
        if (unaries[oper])
            bcc[unaries[oper]]();
        else if (oper === '!!') {
            const lfalse = generateLabel();
            const lend = generateLabel();
            bcc.offset(lfalse);
            bcc.jumpi();
            bcc.value(1);
            bcc.offset(lend);
            bcc.jump();
            bcc.label(lfalse);
            bcc.value(0);
            bcc.label(lend);
        }
    }
    
    this.processBinary = function (node) {
        const oper = node.operator();
        
        if (binaries[oper]) {
            this.process(node.right());
            this.process(node.left());
        
            bcc[binaries[oper]]();

            return;
        }
        
        if (oper === '&&') {
            this.process(node.left());
            bcc.dup(1);
            const ltrue = generateLabel();
            const lfalse = generateLabel();
            const lend = generateLabel();
            bcc.offset(ltrue);
            bcc.jumpi();
            bcc.offset(lfalse);
            bcc.jump();
            bcc.label(ltrue);
            this.process(node.right());
            bcc.offset(lend);
            bcc.jumpi();
            bcc.label(lfalse);
            bcc.pop();
            bcc.value(0);
            bcc.label(lend);
            
            return;
        }
        
        if (oper === '||') {
            this.process(node.left());
            bcc.dup(1);
            const lend = generateLabel();
            bcc.offset(lend);
            bcc.jumpi();
            bcc.pop();
            this.process(node.right());
            bcc.dup(1);
            bcc.offset(lend);
            bcc.jumpi();
            bcc.pop();
            bcc.value(0);
            bcc.label(lend);
            
            return;
        }
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