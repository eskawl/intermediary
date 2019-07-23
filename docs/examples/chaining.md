Chaining with middleware and afterware

```js
let timeMiddleware = [
    Intermediary.createMiddleware((ctx, ...args) => {
        ctx.startTime = new Date();
        return args;
    }),
    Intermediary.createMiddleware((ctx, ...args) => {
        console.log(`Process started at ${ctx.startTime}`);
        return args;
    }),
]

let timeAfterware = [
    Intermediary.createAfterware((ctx, result, ...args) => {
        ctx.endTime = new Date();
        console.log(`Process ended at ${ctx.endTime}. It took ${ctx.endTime - ctx.startTime} ms.`);
        return { result, args }
    })
]

let timeIntermediary = new Intermediary(timeMiddleware, timeAfterware);

let argsMiddleware = [
    (ctx) => (...args) => {
        console.log(`Attempting to process with args: ${args.join(',')}`);
        return args
    }
]

let argsAfterware = [
    (ctx) => (result, ...args) => {
        console.log(`Processed with args: ${args.join(', ')}. Result was ${result}`);
        return { result, args }
    }
]

let argsIntermediary = new Intermediary(argsMiddleware, argsAfterware);

let delay = (duration=2000) => {
    return new Promise(resolve => setTimeout(resolve, duration))
}

let asyncMiddleware = [
    (ctx) => async (...args) => {
        console.log(`Waiting for async task in middleware...`);
        await delay(ctx.delay);
        console.log(`Async task done`);
        return args;
    }
]

let asyncIntermediary = new Intermediary(asyncMiddleware);

let final = (...args) => {
    console.log(`Executing target with args: ${args.join(', ')}`);
    return 'awesome!';
}

(async () => {
    // Wrap argsintermediary over asyncIntermediary which inturn wraps over timeIntermediary.
    // An alternative for:
    // argsIntermediary.involve(
    //     asyncIntermediary.involve(
    //         timeIntermediary.involve(final)
    //     )
    // )(1, 2, 3)

    await Intermediary.series([argsIntermediary, asyncIntermediary, timeIntermediary], final, {delay: 5000})(1,2,3)
    
})()

```

output:
```
Attempting to process with args: 1,2,3
Waiting for async task in middleware...
Async task done
Process started at Mon Jul 01 2019 14:00:09 GMT+0530 (India Standard Time)
Processing.
Process ended at Mon Jul 01 2019 14:00:09 GMT+0530 (India Standard Time). It took 12 ms.
Processed with args: 1, 2, 3. Result was awesome!
```
