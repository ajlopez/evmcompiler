
function Context() {
}

function createContext() {
    return new Context();
}

module.exports = {
    context: createContext
};