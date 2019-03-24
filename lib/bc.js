
function BytecodeCompiler() {
    const bytecodes = [];
    
    this.stop = function () { bytecodes.push(0); return this; };
    
    this.bytecodes = function () {
        let result = '';
        
        for (let k = 0; k < bytecodes.length; k++) {
            let bytecode = bytecodes[k].toString(16);
            
            if (bytecode.length < 2)
                bytecode = '0' + bytecode;
            
            result += bytecode;
        }
        
        return result;
    }
}

function createBytecodeCompiler() {
    return new BytecodeCompiler();
}

module.exports = {
    compiler: createBytecodeCompiler
}
