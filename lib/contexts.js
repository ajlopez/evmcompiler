
function isVariable(value) {
    return typeof value === 'object'
        && value.type !== undefined
        && value.name !== undefined;
}

function Context(parent) {
    const values = {};
    const properties = {};
    let nvars = 0;
    
    this.scope = makeAccesor('scope', true);
    this.visibility = makeAccesor('visibility', true);
    
    this.nvars = function () { return nvars; };
    this.set = function (name, value) { 
        if (isVariable(value)) {
            if (!value.offset)
                value.offset = nvars;
            
            if (!value.scope)
                value.scope = this.scope();
            
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
    
    function makeAccesor(name, inherited) {
        return function (newvalue) {
            if (newvalue)
                properties[name] = newvalue;
            else if (properties[name] == null)
                if (inherited && parent)
                    return parent[name]();
                else
                    return null;
            
            return properties[name];
        }
    }
}

function createContext(parent) {
    return new Context(parent);
}

module.exports = {
    context: createContext
};

