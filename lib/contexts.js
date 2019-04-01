
function Context(scope, parent) {
    const values = {};
    
    this.scope = function () { return scope; };
    this.set = function (name, value) { values[name] = value; };
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