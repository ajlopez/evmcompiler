
var opcodes = {
	stop: 	'00',
	add:  	'01',
	mul:  	'02',
	sub:  	'03',
	div:  	'04',
	sdiv:	'05',
	mod:	'06',
	smod:	'07',
	addmod: '08',
	mulmod: '09',
	exp:	'0a',
	signextend: '0b',
	
	lt:		'10',
	gt:		'11',
	slt:	'12',
	sgt:	'13',
	eq:		'14',
	iszero:	'15',
	and:	'16',
	or:		'17',
	xor:	'18',
	not:	'19',
	byte:	'1a',
	shl:	'1b',
	shr:	'1c',
	sar:	'1d',
	
	sha3:	    '20',
	keccak256:	'20',
	
	address:    '30',
	balance:    '31',
	origin:	    '32',
	caller:	    '33',
	callvalue:	'34',
	calldataload:	'35',
	calldatasize:	'36',
	calldatacopy:	'37',
	codesize:	'38',
	codecopy:	'39',
	gasprice:	'3a',
	extcodesize:	'3b',
	extcodecopy:	'3c',
	returndatasize:	'3d',
	returndatacopy:	'3e',
	extcodehash:	'3f',
	
	blockhash:	'40',
	coinbase:	'41',
	timestamp:	'42',
	number:		'43',
	difficulty:	'44',
	gaslimit:	'45',
	
	pop:	'50',
	mload:	'51',
	mstore:	'52',
	mstore8:	'53',
	sload:	'54',
	sstore:	'55',
	jump:	'56',
	jumpi:	'57',
	pc:		'58',
	msize:	'59',
	gas:	'5a',
	jumpdest:	'5b',
	
	create:	'f0',
	call:	'f1',
	callcode:	'f2',
	return:	'f3',
	delegatecall:   'f4',
    create2:    'f5',
	staticcall:	'fa',
	revert: 'fd',
	selfdestruct:   'ff'
}

var deltas = {
	stop: 	0,
	add:  	-1,
	mul:  	-1,
	sub:  	-1,
	div:  	-1,
	sdiv:	-1,
	mod:	-1,
	smod:	-1,
	addmod: -2,
	mulmod: -2,
	exp:	-1,
	signextend: -1,
	
	lt:		-1,
	gt:		-1,
	slt:	-1,
	sgt:	-1,
	eq:		-1,
	iszero:	0,
	and:	-1,
	or:		-1,
	xor:	-1,
	not:	0,
	byte:	-1,
	shl:	-1,
	shr:	-1,
	sar:	-1,
	
	sha3:	    -1,
	keccak256:	-1,
	
	address:    1,
	balance:    0,
	origin:	    1,
	caller:	    1,
	callvalue:	1,
	calldataload:	0,
	calldatasize:	1,
	calldatacopy:	-3,
	codesize:	1,
	codecopy:	-3,
	gasprice:	1,
	extcodesize:	0,
	extcodecopy:	-4,
	returndatasize:	1,
	returndatacopy:	-3,
	
	blockhash:	0,
	coinbase:	1,
	timestamp:	1,
	number:		1,
	difficulty:	1,
	gaslimit:	1,
	
	pop:	-1,
	mload:	0,
	mstore:	-2,
	mstore8:	-2,
	sload:	0,
	sstore:	-2,
	jump:	-1,
	jumpi:	-2,
	pc:		1,
	msize:	1,
	gas:	1,
	jumpdest:	0
}

function toHex(value, length) {
    let result = value.toString(16);
    
    if (result.length < length * 2)
        result = '0'.repeat(length * 2 - result.length) + result;
    
    return result;
}

function BytecodeCompiler() {
    const self = this;
    const bytecodes = [];
    const labels = {};
    
    let ssize = 0;
    
    this.ssize = function () { return ssize; };

    for (let n in opcodes) {
        this[n] = makefn(n);
        
        function makefn(n) {
            return function () {
                bytecodes.push(opcodes[n]);
                ssize += deltas[n];
                return self;
            }
        }
    };
    
    this.label = function (name) {
        const label = getLabel(name);
        
        label.offset = bytecodes.length;
        
        for (let k = 0; k < label.pending.length; k++)
            resolve(label.pending[k], label.offset);
        
        this.jumpdest();
    }
    
    function getLabel(name) {
        if (labels[name] == null)
            labels[name] = { pending: [] };
        
        return labels[name];
    }
    
    function resolve(position, offset) {
        const value = toHex(offset, 2);
        bytecodes[position + 1] = value.substring(0, 2);
        bytecodes[position + 2] = value.substring(2, 4);
    }
    
    this.offset = function (name) {
        const label = getLabel(name);
        
        if (label.offset != null)
            this.value(toHex(label.offset, 2));
        else {
            label.pending.push(bytecodes.length);
            
            this.value('____');
        }
    }
    
    this.push = function (n) {
        bytecodes.push((0x60 + n - 1).toString(16));
        ssize++;
        return self;
    };
    
    this.dup = function (n) {
        bytecodes.push((0x80 + n - 1).toString(16));
        ssize++;
        return self;
    };
    
    this.swap = function (n) {
        bytecodes.push((0x90 + n - 1).toString(16));
        return self;
    };
    
    this.value = function (value) {
        let svalue;
        
        if (typeof value === 'string')
            if (value.startsWith('0x'))
                svalue = value.substring(2);
            else
                svalue = value;
        else
            svalue = value.toString(16);
        
        if (svalue.length % 2)
            svalue = '0' + svalue;
        
        this.push(svalue.length / 2);
        
        for (let k = 0; k < svalue.length; k += 2)
            bytecodes.push(svalue.substring(k, k + 2));
    };

    this.bytecodes = function () {
        return bytecodes.join('');
    };
}

function createBytecodeCompiler() {
    return new BytecodeCompiler();
}

module.exports = {
    compiler: createBytecodeCompiler
}
