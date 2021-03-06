
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

// TODO other operations
function isSignedOperation(binoper) {
return binoper === 'div' || binoper === 'mod';
}

// TODO check type of all nodes
function isSigned(node) {
    if (!node.type)
        return false;
    
    if (!node.type())
        return false;
    
    return node.type().startsWith('int');
}

function normalizeType(type) {
    if (type.ntype && type.ntype() === 'array')
        return normalizeType(type.type()) + '[]';
    
    if (type === 'uint')
        return 'uint256';
    
    return type;
}

function getFunctionSignature(node) {
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
    
    this.enterfn = function (visibility, arity) {
        context.fn({ ssize: bcc.ssize(), visibility: visibility, arity: arity });
    }
    
    this.loadLocal = function (offset) {
        const ssize = bcc.ssize();
        const pos = context.fn().ssize + offset;
        
        bcc.dup(ssize - pos);
    }
    
    this.storeLocal = function (offset) {
        const ssize = bcc.ssize();
        const pos = context.fn().ssize + offset;
        
        bcc.swap(ssize - pos - 1);
        bcc.pop();
    }
    
    this.loadDataArgument = function (offset) {
        bcc.value(offset * 32 + 4);
        bcc.calldataload();
    };
    
    this.loadStackArgument = function (offset) {
        // TODO skip local variables
        bcc.dup(context.fn().arity - offset + bcc.ssize() - context.fn().ssize);
    };
    
    function generateFunctionCall(functionname) {
        const funct = context.get(functionname);
        
        bcc.dup(1);
        bcc.value(funct.hash);
        bcc.eq();
        bcc.offset(functionname);
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
            generateFunctionCall(fnnames[k]);
        
        bcc.label('revert0');
        bcc.revert();
    }
    
    this.processContract = function (node) {
        context = contexts.context();
        context.scope('contract');
        fnnames = [];
        
        const nodes = node.body().nodes();
        
        for (let k = 0, l = nodes.length; k < l; k++) {
            const node = nodes[k];
            const ntype = node.ntype();
            
            if (ntype === 'variable')
                this.preprocessVariable(node);
            else if (ntype === 'function')
                this.preprocessFunction(node);
        }
        
        generateContractPrologue();
            
        node.body().process(this);
    };
    
    this.processSequence = function (node) {
        const nodes = node.nodes();
        
        for (let k = 0, l = nodes.length; k < l; k++)
            nodes[k].process(this);
    };
    
    this.preprocessFunction = function (node) {
        const fnname = getFunctionSignature(node);
        
        const fn = {
            signature: fnname,
            hash: keccak(fnname).substring(0, 8)
        };
        
        context.set(fnname, fn);
        fnnames.push(fnname);
    };
    
    this.processFunction = function (node) {
        const functionname = getFunctionSignature(node);
        const args = node.arguments();
        
        const originalContext = context;
        context = contexts.context(originalContext);
        context.scope('function');
        this.enterfn(node.attributes().visibility, args.length);
        
        bcc.label(functionname);
        
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
    
    function removeLocalVariables() {
        let nvars = context.nvars();
        
        if (context.fn().visibility !== 'public')
            nvars += context.fn().arity;
        
        while (nvars > 0) {
            bcc.pop();
            nvars--;
        }
    }
    
    this.processReturn = function (node) {
        const expression = node.expression();
        
        if (expression == null) {
            removeLocalVariables();
            
            bcc.stop();
            
            return;
        }
        
        expression.process(this);
        this.value(0);
        bcc.mstore();

        removeLocalVariables();
        
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
        
        let vardef = {
            name: name,
            type: type
        };
        
        // TODO improve array detection and its length
        if (vardef.type.endsWith('[]'))
            vardef.length = node.type().length().value();
        
        context.set(name, vardef);
        
        if (context.scope() === 'function')
            bcc.value(0);
    };
    
    this.processVariable = function (node) {
        if (context.scope() !== 'function')
            return;
        
        const name = node.name();
        const vardef = context.get(name);
        const expr = node.expression();
        
        if (expr) {
            expr.process(this);
            this.storeLocal(vardef.offset);
        }
    };
    
    // TODO node with complex expression
    this.processIndexed = function (node) {
        const varname = node.target().name();
        const vardef = context.get(varname);

        // TODO process other scopes than storage
        bcc.value(vardef.offset);
        
        this.process(node.index());
        
        bcc.add();
        bcc.sload();
    };
    
    this.processName = function (node) {
        const varname = node.name();
        const vardef = context.get(varname);

        if (vardef.scope === 'contract') {
            bcc.value(vardef.offset);
            bcc.sload();
        }
        else if (vardef.scope === 'argument')
            if (context.fn().visibility === 'public')
                this.loadDataArgument(vardef.offset);
            else
                this.loadStackArgument(vardef.offset);
        else if (vardef.scope === 'function')
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
        else if (vardef.scope === 'function')
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
        const left = node.left();
        const right = node.right();
        
        if (binaries[oper]) {
            this.process(right);
            this.process(left);
            
            let boper = binaries[oper];
            
            if (isSignedOperation(boper) && (isSigned(left) || isSigned(right)))
                boper = 's' + boper;
        
            bcc[boper]();

            return;
        }
        
        if (oper === '&&') {
            this.process(left);
            bcc.dup(1);
            const ltrue = generateLabel();
            const lfalse = generateLabel();
            const lend = generateLabel();
            bcc.offset(ltrue);
            bcc.jumpi();
            bcc.offset(lfalse);
            bcc.jump();
            bcc.label(ltrue);
            this.process(right);
            bcc.offset(lend);
            bcc.jumpi();
            bcc.label(lfalse);
            bcc.pop();
            bcc.value(0);
            bcc.label(lend);
            
            return;
        }
        
        if (oper === '||') {
            this.process(left);
            bcc.dup(1);
            const lend = generateLabel();
            bcc.offset(lend);
            bcc.jumpi();
            bcc.pop();
            this.process(right);
            bcc.dup(1);
            bcc.offset(lend);
            bcc.jumpi();
            bcc.pop();
            bcc.value(0);
            bcc.label(lend);
            
            return;
        }
    }
    
    this.processCall = function (node) {
        const label = generateLabel();
        bcc.offset(label);
        const args = node.arguments();
        
        for (let k = 0, l = args.length; k < l; k++)
            this.process(args[k]);
        
        bcc.offset(node.target().name());
        bcc.jump();
        bcc.label(label);
    };
    
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