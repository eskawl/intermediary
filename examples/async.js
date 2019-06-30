const {default: Intermediary} =  require('../lib/intermediary');

let delay = (duration=2000) => {
    return new Promise(resolve => setTimeout(resolve, duration))
}

let middleware = [
    (ctx) => (next) => async (...args) => {
        console.log(`Waiting for async task in middleware...`);
        await delay(ctx.delay);
        console.log(`Async task done`);
        return next(...args);
    }
]

let final = () => {
    console.log('Processing.');
}

let intermediary = new Intermediary(middleware);
let involved = intermediary.involve(final);

if (require.main === module) {
    (async () => {
        await involved();
    })()
}

exports.intermediary = intermediary;