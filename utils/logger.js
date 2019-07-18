function logger(error) {
    const nodeEnv = process.env.NODE_ENV
    if (nodeEnv === 'test') {
        return
    }
    console.log(error)
}

module.exports = exports = logger
