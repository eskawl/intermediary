
Middleware functions are invoked before the actual target function is invoked
by the intermediary. All the middleware supplied are executed by the intermediary every 
time it is involved on a target function.


### Creating a middleware
Middleware functions have the following function signature. 
This is heavily inspired from the redux middleware.

```js
const m1 = (context) => (next) => (...targetArgs) => {
    console.log('My first middleware.')
    return next(...targetArgs)
};

const middleware = [m1];
```

### Structure
Middleware functions have a reference to 
* the current context - this can be supplied to the involve function.
* the next middleware in the stack
* the arguments for the next middleware in the stack

The middleware functions must always return the result of `next(...targetArgs)`. 

You can also use the static helper function `createMiddleware` to create a middleware
function. Writing functions in the above manner could be cumbersome.
Passing a callback function which takes `(ctx, next, ...targetArgs)` as arguments 
will be cleaner way to construct middleware.
This callback function should return `next(...targetArgs)` when it is done.

```js
const m1 = Intermediary.createMiddleware((context, next, ...targetArgs) => {
    console.log('My first middleware.');
    return next(...targetArgs);
})

const middleware = [m1]
```

The target args can also be expanded ahead of time, if you know what they would be.

```js
const m1 = Intermediary.createMiddleware((context, next, a, b, c) => {
    console.log('My first middleware.');
    return next(a, b, c);
})

const middleware = [m1];

const intermediary = new Intermediary(middleware);
const final = (a, b, c) => {
    console.log(`Final function executed with ${a}, ${b}, ${c}`)
}

intermediary.involve(final)(1, 2, 3);
```

outputs:
```
My first middleware.
Final function executed with 1, 2, 3
```

If you are intending to write a middleware that can be applied anywhere,
spread syntax `...targetArgs` is something you may want.


### Stacking
Multiple middleware can be stacked together. 
They are executed in the order supplied to the intermediary. To provide multiple middleware just 
append them to the middleware array.

```js
const m1 = Intermediary.createMiddleware((context, next, ...targetArgs) => {
    console.log('My first middleware.')
    return next(...targetArgs)
};

const m2 = Intermediary.createMiddleware((context, next, ...targetArgs) => {
    console.log('My second middleware.')
    return next(...targetArgs)
};

middleware = [m1, m2];

const intermediary = new Intermediary(middleware);
const final = (a, b, c) => {
    console.log(`Final function executed with ${a}, ${b}, ${c}`);
}

intermediary.involve(final)(1, 2, 3);
```

Outputs:
```
My first middleware.
My second middleware.
Final function executed with 1, 2, 3
```

### Context
A context can be supplied while involving the intermediary.
If no context is provided an empty object will be passed by default.
The context can be mutated by the middleware to maintain any values that
are necessary for the other middleware / afterware in the stack.
See [Context](/basic-concepts#Context)

### Async
The middleware functions can also be async. The next middleware in the stack
will only be called after the async middleware finishes execution. The involved function is 
always an async function and you can await it.

```js
function final(a, b, c) {
    console.log(`Executing target function with ${a}, ${b}, ${c}`);
    return ':D';
}

function delay(delay = 2000) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    })
}

const m1 = Intermediary.createMiddleware(async (context, next, a, b, c) => {
    console.log("Waiting for async task")
    await delay();
    console.log(`Executing first middleware`);
})

const intermediary = new Intermediary([m1]);
const involved = intermediary.involve(final);

(async () => {
    await involved(1, 2, 3);
})
```

output:
```
Waiting for async task
Executing first middleware
Executing target function with 1, 2, 3
```

