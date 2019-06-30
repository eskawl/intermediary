Chaining with middleware and afterware

```js
let timeMiddleware = [
    Intermediary.createMiddleware((ctx, next, ...args) => {
        ctx.startTime = new Date();
        return next(...args);
    }),
    Intermediary.createMiddleware((ctx, next, ...args) => {
        console.log(`Process started at ${ctx.startTime}`);
        return next(...args);
    }),
]

let timeAfterware = [
    Intermediary.createAfterware((ctx, next, result, ...args) => {
        ctx.endTime = new Date();
        console.log(`Process ended at ${ctx.endTime}. It took ${ctx.endTime - ctx.startTime} ms.`);
        return next(...args)
    })
]

let argsMiddleware = [
    (ctx) => (next) => (...args) => {
        console.log(`Attempting to process with args: ${args.join(',')}`);
        return next(...args)
    }
]

let argsAfterware = [
    (ctx) => (next) => (result, ...args) => {
        console.log(`Processed with args: ${args.join(', ')}. Result was ${result}`);
        return next(result, ...args)
    }
]

let delay = (duration=2000) => {
    return new Promise(resolve => setTimeout(resolve, duration))
}

let asyncMiddleware = [
    (ctx) => (next) => async (...args) => {
        console.log(`Waiting for async task in middleware...`);
        await delay(ctx.delay);
        console.log(`Async task done`);
        return next(...args);
    }
]

let timeIntermediary = new Intermediary(timeMiddleware, timeAfterware);
let argsIntermediary = new Intermediary(argsMiddleware, argsAfterware);
let asyncIntermediary = new Intermediary(asyncMiddleware);

let final = (...args) => {
    console.log(`Executing target with args: ${args.join(', ')}`);
    return 'awesome!';
}

(async () => {
    await Intermediary.series([argsIntermediary, asyncIntermediary, timeIntermediary], final, {delay: 5000})(1,2,3)
    // alternative for argsIntermediary.involve(timeIntermediary.involve(final))(1, 2, 3)
})()

```


