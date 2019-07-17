const Intermediary =  require('../lib/intermediary');

let middleware = [
    // (ctx) => (next) => (...args) => {
    //     ctx.startTime = new Date();
    //     console.log(`Process started at ${ctx.startTime}`);
    //     return next(...args)
    // }
    Intermediary.createMiddleware((ctx, ...args) => {
        ctx.startTime = new Date();
        return args
    }),
    Intermediary.createMiddleware((ctx, ...args) => {
        console.log(`Process started at ${ctx.startTime}`);
        return args
    }),
]


let afterware = [
    // (ctx) => (next) => (...args) => {
    //     ctx.endTime = new Date();
    //     console.log(`Process ended at ${ctx.endTime}. It took ${ctx.endTime - ctx.startTime} ms.`);
    //     return next(...args)
    // }

    Intermediary.createAfterware((ctx, result, ...args) => {
        ctx.endTime = new Date();
        console.log(`Process ended at ${ctx.endTime}. It took ${ctx.endTime - ctx.startTime} ms.`);
        return { result, args }
    })
]

let final = () => {
    console.log('Processing.');
}

let intermediary = new Intermediary(middleware, afterware);
let involved = intermediary.involve(final);

if (require.main === module) {
    (async () => {
        await involved();
    })()
}

exports.intermediary = intermediary;