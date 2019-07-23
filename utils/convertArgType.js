function convertArgType(args) {
    const argType = typeof args
    if (argType !== 'object') {
        return [args]
    }
    return args
}

module.exports = exports = convertArgType
