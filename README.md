## Intermediary

Have hooks and middleware for just about any function.


[![npm version](https://img.shields.io/npm/v/intermediary.svg?logo=npm&style=popout)](https://www.npmjs.org/package/intermediary)
[![build status](https://img.shields.io/travis/eskawl/intermediary.svg?logo=travis&style=popout)](https://travis-ci.org/eskawl/intermediary)
[![bundle size](https://img.shields.io/bundlephobia/minzip/intermediary.svg?logo=webpack&style=popout-square)](https://bundlephobia.com/result?p=intermediary@1.0.0)

### Features
- Execute middleware before your function executes
- Execute afterware after your function executes
- Organize and compose repeated workflows
- Asynchronous middleware and afterware support
- Works in node as well as browser


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

If using the CDN, Intermediary is available at `window.Intermediary`.

### Usage: see http://eskawl.github.io/intermediary


### Migrating from 1.x to 2.x
s
* Middleware and Afterware executor is removed. Therefore, no use of a executor function that takes a `next` argument and return the `next(args)`

* In middleware, instead of returning `next(args)`, return `[...args]` in an array form

* In afterware, instead of returning `next(args)`, return `{result: <result to be used by next afterware>, args: <arguments to be used by next afterware>}`

* Afterware callback takes `result` from previous afterware/target as first argument and remaining arguments with it

* Extra argument as config can be sent to `involve` or `series`. It includes the flag for `throwOnMiddleware, throwOnTarget, throwOnAfterware`