
function isVariable(value) {
    return typeof value === 'object'
        && value.type !== undefined
        && value.name !== undefined;
}

function Context(parent) {
    let scope = null;
    const values = {};
    let nvars = 0;
    
    this.scope = function (newscope) { 
        if (newscope)
            scope = newscope;
        else
            return scope; 
    };
    
    this.nvars = function () { return nvars; };
    this.set = function (name, value) { 
        if (isVariable(value)) {
            if (!value.offset)
                value.offset = nvars;
            
            if (!value.scope)
                value.scope = scope;
            
            nvars++;
        }
        
        values[name] = value; 
    };
    
    this.get = function (name) {
        if (values[name] != null)
            return values[name];
        
        if (parent != null)
            return parent.get(name);
        
        return null;
    }
}

function createContext(parent) {
    return new Context(parent);
}

module.exports = {
    context: createContext
};

