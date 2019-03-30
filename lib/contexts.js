
function Context() {
    const values = {};
    
    this.set = function (name, value) { values[name] = value; };
    this.get = function (name) { return values[name]; }
}

function createContext() {
    return new Context();
}

module.exports = {
    context: createContext
};