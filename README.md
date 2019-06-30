## Intermediary

Have hooks and middleware for just about any function.

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
<script src="https://cdn.jsdelivr.net/gh/eskawl/intermediary@master/lib/intermediary.min.js"></script>
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

If using the CDN, Intermediary is available at `window.Intermeidary`.

### Usage: see http://eskawl.github.io/intermediary