
Afterware functions are invoked after the actual target function is invoked
by the intermediary. All the afterware supplied are executed by the intermediary every 
time it is involved on a target function.


### Creating an afterware
Afterware functions have the following function signature. 

```js
const a1 = (context) => (next) => (targetResult, ...targetArgs) => {
    console.log('My first afterware.')
    return next(targetResult, ...targetArgs)
};

const afterware = [a1];
```

Writing functions in this manner could be cumbersome.
You can also use the static helper function `createAfterware` to create a middleware
function. Result will be the return value of the target function on which this intermediary was involved.
Target Args will be actual arguments by which the target function was invoked.
These might be different from the one's passed to the involved function as the middleware
will be able to modify the arguments.
The fn should return next(result, ...targetArgs) when done.  

```js
const a1 = Intermediary.createAfterware((context, next, targetResult, ...targetArgs) => {
    console.log('My first afterware.');
    return next(...targetArgs);
})

const afterware = [a1]
```

The target args can also be expanded ahead of time, if you know what they would be.

```js
const a1 = Intermediary.createAfterware((context, next, result, a, b, c) => {
    console.log('My first afterware.');
    return next(a, b, c);
})
```

If you are intending to write a middleware that can be applied anywhere,
spread syntax `...targetArgs` is something you may want.

### Structure
Afterware function have a reference to 
* the current context - this can be supplied to the involve function.
* the next afterware in the stack
* the arguments for the next afterware in the stack

The afterware functions must always return the result of `next(...targetArgs)`. 

### Stacking
Multiple afterware can be stacked together. 
They are executed in the order supplied to the intermediary. To provide multiple afterware just 
append them to the middleware array.

```js
const a1 = Intermediary.createMiddleware((context, next, result, ...targetArgs) => {
    console.log('My first afterware.')
    console.log(`Result was ${result}`);
    return next(...targetArgs)
};

const a2 = Intermediary.createMiddleware((context, next, result, ...targetArgs) => {
    console.log('My second afterware.')
    return next(...targetArgs)
};

const afterware = [a1, a2];

const intermediary = new Intermediary(null, afterware);
const final = (a, b, c) => {
    console.log(`Final function executed with ${a}, ${b}, ${c}`);
    return a + b + c;
}

intermediary.involve(final)(1, 2, 3);
```

Outputs:
```
Final function executed with 1, 2, 3
My first afterware.
Result was 6.
My second afterware
```

### Context
A context can be supplied while involving the intermediary.
If no context is provided an empty object will be passed by default.
The context can be mutated by the middleware to maintain any values that
are necessary for the other middleware / afterware in the stack.

This context is the same as supplied to the middleware and will have all the
changes made by the middleware executed prior to this afterware.

### Async
Afterware can also be async. See middleware docs for more info.