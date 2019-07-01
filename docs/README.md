
Have hooks and middleware for just about any function.

### Features
- Execute middleware before your function executes
- Execute afterware after your function executes
- Organize and compose repeated workflows
- Asynchronous middleware and afterware support
- Works in node as well as browser


### Why?
This library was born out of a need to add resolver based middleware
to graphql. With this, middleware can be composed and applied specifically
to certain resolvers based on the need (see [graphql example](/examples/graphql)).  
That being said, this is not
tied to graphql in any manner and can be used on any function as required.


### Installing

Using NPM:

```bash
npm i intermediary
```

Using yarn:

```bash
yarn add intermediary
```

UMD Build CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/intermediary/lib/intermediary.min.js"></script>
```

### Getting Started

#### Importing

Common JS:

```js
const Intermediary = require('intermediary')
```

ES6:

```js
import Intermediary from 'intermediary';
```
Browser:

If using the CDN, Intermediary is available at `window.Intermeidary`.

#### Adding middleware:

Intermediary allows to specify a list of middleware to be executed before a function.
Middleware can be created using `Intermediary.createMiddleware` static function.
The callback must return `next(...args)`. 

```js
const startTime = Intermediary.createMiddleware((ctx, next, ...args)=>{
	console.log(`Started at ${new Date()}`);
	return next(...args);
});

const middleware = [
	startTime
]
```

#### Creating an intermediary

Create an intermediary by passing the middleware array

```js
const intermediary = new Intermediary(middleware);
```

#### Apply the intermediary

Intermediary can be applied on an unsuspecting function using the `involve` method. The intermediary can be reused on as many functions as necessary. 

All these functions will be executed with the configured middleware stack.
```js
const targetFunction = (...args) => {
	console.log(`Target function executed with ${args.join(', ')}`)
}

const involved = intermediary.involve(targetFunction);

```

#### Use the involved function
The `involved` function will return a promise (as middleware can also be async) which will be resolved after successful execution of middleware and the targetFunction.

```js
involved(1,2,3)
```

output:

```bash
> Started at Thu Jun 27 2019 18:31:26 GMT+0530 (India Standard Time)
> Target function executed with 1, 2, 3

```

Read [Basic concepts](/basic-concepts)