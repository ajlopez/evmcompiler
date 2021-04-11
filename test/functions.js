
const compilers = require('../lib/compilers');
const keccak = require('../lib/sha3').keccak_256;
const geast = require('geast');
const contexts = require('../lib/contexts');

exports['process empty function'] = function (test) {
    const compiler = compilers.compiler();
    compiler.context(contexts.context());
    const node = geast.function('foo', 'void', [], geast.sequence([]), { visibility: 'public' });
    
    compiler.process(node);
    
    test.equal(compiler.bytecodes(), "5b00");
}

exports['process private function that receives an argument and returns value'] = function (test) {
    const compiler = compilers.compiler();
    compiler.context(contexts.context());
    const node = geast.function('foo', 'uint',
        [ geast.argument('value', 'uint') ], 
        geast.sequence([
            geast.return(
                geast.binary('+', 
                    geast.name('value'), 
                    geast.constant(1))
            )
        ]),
        { visibility: 'private' }
    );
    
    compiler.process(node);
    
    const code = compiler.bytecodes();
    
    test.equal(code, "5b600181016000525060206000f3");
}

