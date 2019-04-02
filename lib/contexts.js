
function isVariable(value) {
    return typeof value === 'object'
        && value.type !== undefined
        && value.name !== undefined;
}

function Context(scope, parent) {
    scope = scope || 'program';
    const values = {};
    let nvars = 0;
    
    this.scope = function () { return scope; };
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

function createContext(scope, parent) {
    return new Context(scope, parent);
}

module.exports = {
    context: createContext
};

