An intermediary can have stacks of middleware and afterware.

```js
const middleware = [m1, m2, m3];
const afterware = [a1, a2, a3];
const intermediary = new Intermediary(middleware, afterware);
```

For detailed information on how to create a middleware and afterware
see [Middleware](/middleware) and [Aftwerware](/afterware).

### Involve function

The intermediary can be involved on any function using the `involve` method.
A single intermediary can be involved on multiple functions.
The involve function returns an async function (involved function). 
Invoking this involved function
will execute the middleware first in the order 
they were provided, the target function and then the afterware in the order
they were provided. The returned function will be an async function.

```js
const roar = ()=> {
    console.log("ROAR!!")
}

const purr = () => {
    console.log("purr..")
}

const involvedRoar = intermediary.involve(roar);
const involvedPurr = intermediary.involve(purr);

involvedRoar();
involvedPurr();

```

### Context

You can also provide some context to the intermediary while you are
involving it. This context will be passed across the middleware and afterware stacks.
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
    let msg = (`${msg}! `).repeat(ctx.repeatCount);
    return next(msg);
})

const shouter = Intermediary.createMiddleware((ctx, next, msg)=>{
    let msg = msg.toUpperCase();
    return next(msg);
})

const intermediary = new Intermediary([addCount, repeater, shouter]);

const shoutThrice =  intermediary.involve(say, {repeatCount: 3});

shoutThrice('abcd');
// ABCD! ABCD! ABCD! ABCD! 
```

### Series 
You can also chain intermediaries using the series method for better composition.
This way you can mix and match intermediaries to reuse them.
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
// John says: // ABCD! ABCD! ABCD!

```