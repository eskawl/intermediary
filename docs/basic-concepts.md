An intermediary can have stacks of middleware and afterware.

```js
let m1 = Intermediary.createMiddleware((ctx, ...args) => {
    console.log('My first middleware');
    return args
});

let m2 = Intermediary.createMiddleware((ctx,  ...args) => {
    console.log('another middleware');
    return args
});

let a1 = Intermediary.createAfterware((ctx, result, ...args) => {
    console.log('My first afterware');
    return { result, args }
});

let a2 = Intermediary.createAfterware((ctx, result, ...args) => {
    console.log('another afterware');
    return { result, args }
});

const middleware = [m1, m2];
const afterware = [a1, a2];
const intermediary = new Intermediary(middleware, afterware);
```

### Involve function

The intermediary can be involved on any function using the `involve` method.
The first argument to the involve method is the target function on which 
this intermediary is to be applied on. The involve function returns an 
async function (involved function). 

```js
const roar = ()=> {
    console.log("ROAR!!")
}

const involvedRoar = intermediary.involve(roar);
```

Invoking this involved function
will execute the middleware first in the order 
they were provided, the target function next and then the afterware in the order
they were provided.

```js
involvedRoar();
```

output:
```
My first middleware
another middleware
ROAR!!
My first afterware
another afterware
```

A single intermediary can be involved on multiple functions.

```js
const purr = () => {
    console.log("purr..")
}

const involvedPurr = intermediary.involve(purr);

involvedPurr();
```

output:
```
My first middleware
another middleware
purr..
My first afterware
another afterware
```

For detailed information on how to create a middleware and afterware
see [Middleware](/middleware) and [Aftwerware](/afterware).

### Context

You can also provide some context to the intermediary while you are
involving it by passing it as a second argument to the `involve` function. 
This context will be passed across the middleware and afterware stacks.
If no context is provided an empty object will be passed.

```js
const say = (msg) => {
    console.log(msg);
}

const addCount = Intermediary.createMiddleware((ctx, msg) => {
    ctx.repeatCount = ctx.repeatCount + 1;
    return msg;
});

const repeater = Intermediary.createMiddleware((ctx, msg) => {
    msg = (`${msg}! `).repeat(ctx.repeatCount);
    return msg;
});

const shouter = Intermediary.createMiddleware((ctx, msg)=>{
    msg = msg.toUpperCase();
    return msg;
});

const intermediary = new Intermediary([addCount, repeater, shouter]);

const shoutThrice =  intermediary.involve(say, {repeatCount: 2});

shoutThrice('abcd');
// ABCD! ABCD! ABCD!
```

### Series 
You can also chain intermediaries using the series method for better composition.
This way you can mix and match intermediaries to reuse them. See [this example](/examples/chaining)
for using afterware in a series.
```js
const intermediary1 = new Intermediary([addCount]);
const intermediary2 = new Intermediary([repeater, shouter]);

shout = Intermediary.series([intermediary1, intermediary2], say, {repeatCount: 3})

shout('abcd');  // ABCD! ABCD! ABCD! ABCD! 
```

### Binding instance methods
To apply intermediary on a instance method, bind the function and pass it to the 
intermediary

```js
function Person(name) {
    this.name = name;
}

Person.prototype.say = function(msg){
    console.log(
        `${this.name} says: ${msg}`
    )
}

const p = new Person('John');

const intermediary = new Intermediary([repeater, shouter]);
intermediary.involve(p.say.bind(p), {repeatCount: 3})('abcd');
// John says: ABCD! ABCD! ABCD!
```

### Config

You can also provide configuration object to the involve or series.
It is the third argument in involve and fourth argument in series.

 Name | Data type | Default value | Description
------------- | ------------- | ------------- | ---------
throwOnMiddleware | Boolean | true | if false, it won't halt on any error that occurs in middleware and retains the previous arguments to the next middleware's arguments. Otherwise, the execution stops when any error occurs in middleware
throwOnTarget | Boolean | true | if false, it won't halt on any error that occurs in target function and retains the last middleware's argument to the next afterware's argument. Otherwise, the execution stops when any error occurs in target function
throwOnAfterware | Boolean | true | if false, it won't halt on any error that occurs in afterware and retains the previous arguments to the next afterware's arguments. Otherwise, the execution stops when any error occurs in afterware


```js
let m1 = Intermediary.createMiddleware((ctx, ...args) => {
    console.log('M1');
    return args
});

let m2 = Intermediary.createMiddleware((ctx,  ...args) => {
    console.log('M2');
    throw new Error('Some error occurred in middleware M2')
});

let m3 = Intermediary.createMiddleware((ctx, ...args) => {
    console.log('M3');
    /* Arguments retain here from the previous middleware */
    return args
});

let say = () => {
    throw new Error('some error occurred in target function')
}

let a1 = Intermediary.createAfterware((ctx, result, ...args) => {
    console.log('A1');
    return { result, args }
});

let a2 = Intermediary.createAfterware((ctx, result, ...args) => {
    console.log('A2');
    throw new Error('Some error occurred in afterware A2')
});

let a3 = Intermediary.createAfterware((ctx, result, ...args) => {
    console.log('A3');
    /* Arguments retain here from the previous afterware */
    return { result, args }
});

/* Example 1 */
const intermediary = new Intermediary([m1, m2, m3], [a1, a2, a3]);
const involved = intermediary.involve(say, {}, {
    throwOnMiddleware: false,
    throwOnTarget: false,
    throwOnAfterware: false,
})
involved(1, 2, 3)
```

output

```
M1
M2
Error: Some error occurred in middleware M2
M3
Error: some error occurred in target function
A1
A2
Error: Some error occurred in afterware A2
A3
```

```js

/* Example 2 */
const intermediary1 = new Intermediary([m1, m2], [a1, a2]);
const intermediary2 = new Intermediary([m2, m3], [a2, a3]);

const series = Intermediary.series([intermediary1, intermediary2], say, {}, {
    throwOnMiddleware: false,
    throwOnTarget: false,
    throwOnAfterware: false,
})
series(1, 2, 3)

```

output

```
M1
M2
Error: Some error occurred in middleware M2
A1
A2
Error: Some error occurred in afterware A2
M2
Error: Some error occurred in middleware M2
M3
Error: some error occurred in target function
A2
Error: Some error occurred in afterware A2
A3
```