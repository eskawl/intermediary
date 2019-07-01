An intermediary can have stacks of middleware and afterware.

```js
let m1 = Intermediary.createMiddleware((ctx, next ...args) => {
    console.log('My first middleware');
    return next(...args);
});

let m2 = Intermediary.createMiddleware((ctx, next, ...args) => {
    console.log('another middleware');
    return next(...args);
});

let a1 = Intermediary.createMiddleware((ctx, next ...args) => {
    console.log('My first afterware');
    return next(...args);
});

let a2 = Intermediary.createMiddleware((ctx, next, ...args) => {
    console.log('another afterware');
    return next(...args);
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

const addCount = Intermediary.createMiddleware((ctx, next, msg) => {
    ctx.repeatCount = ctx.repeatCount + 1;
    return next(msg);
});

const repeater = Intermediary.createMiddleware((ctx, next, msg) => {
    msg = (`${msg}! `).repeat(ctx.repeatCount);
    return next(msg);
});

const shouter = Intermediary.createMiddleware((ctx, next, msg)=>{
    msg = msg.toUpperCase();
    return next(msg);
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