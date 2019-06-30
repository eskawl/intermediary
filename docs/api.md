## Classes

<dl>
<dt><a href="#Intermediary">Intermediary</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Middleware">Middleware</a> ⇒ <code><a href="#MiddlewareExecutor">MiddlewareExecutor</a></code></dt>
<dd><p>A middleware function.</p>
</dd>
<dt><a href="#Afterware">Afterware</a> ⇒ <code><a href="#AfterwareExecutor">AfterwareExecutor</a></code></dt>
<dd><p>An Afterware function.</p>
</dd>
<dt><a href="#MiddlewareExecutor">MiddlewareExecutor</a> ⇒ <code><a href="#MiddlewareController">MiddlewareController</a></code></dt>
<dd><p>A middleware executor</p>
</dd>
<dt><a href="#AfterwareExecutor">AfterwareExecutor</a> ⇒ <code><a href="#MiddlewareController">MiddlewareController</a></code></dt>
<dd><p>An afterware executor</p>
</dd>
<dt><a href="#MiddlewareController">MiddlewareController</a> ⇒</dt>
<dd><p>Middleware Controller
This holds the acutal body of the middleware function.
This function must return the next function&#39;s result.
It can be obtained by invoking next function passed on to it by the executor with the arguments this controller got.</p>
</dd>
<dt><a href="#AfterwareController">AfterwareController</a> ⇒</dt>
<dd><p>Afterware Controller
This holds the acutal body of the middleware function.
This function must return the next function&#39;s result.
It can be obtained by invoking next function passed on to it by the executor with the arguments this controller got.</p>
</dd>
<dt><a href="#CreateMiddlewareCallback">CreateMiddlewareCallback</a> : <code>callback</code></dt>
<dd><p>This callback is the hold the middleware controller logic.
This function must return the next function&#39;s result invoked with the arguments it got.</p>
</dd>
<dt><a href="#CreateAfterwareCallback">CreateAfterwareCallback</a> : <code>callback</code></dt>
<dd><p>This callback is the hold the afterware controller logic.
This function must return the next function&#39;s result invoked with the arguments it got.</p>
</dd>
</dl>

<a name="Intermediary"></a>

## Intermediary
**Kind**: global class  

* [Intermediary](#Intermediary)
    * [new Intermediary(middleware, afterware)](#new_Intermediary_new)
    * _instance_
        * [.involve(target, context)](#Intermediary+involve) ⇒ <code>function</code>
    * _static_
        * [.series(intermediaries, target)](#Intermediary.series) ⇒ <code>function</code>
        * [.createMiddleware(fn)](#Intermediary.createMiddleware) ⇒ [<code>Middleware</code>](#Middleware)
        * [.createAfterware(fn)](#Intermediary.createAfterware) ⇒ [<code>Afterware</code>](#Afterware)

<a name="new_Intermediary_new"></a>

### new Intermediary(middleware, afterware)
Instantiates a new intermediary with the provided middleware and afterware


| Param | Type |
| --- | --- |
| middleware | [<code>Array.&lt;Middleware&gt;</code>](#Middleware) | 
| afterware | [<code>Array.&lt;Afterware&gt;</code>](#Afterware) | 

<a name="Intermediary+involve"></a>

### intermediary.involve(target, context) ⇒ <code>function</code>
Attaches the intermediary's middleware and afterware stack to the 
target function and returns and involved function.

**Kind**: instance method of [<code>Intermediary</code>](#Intermediary)  
**Returns**: <code>function</code> - Involved function  

| Param | Type | Description |
| --- | --- | --- |
| target | <code>\*</code> |  |
| context |  | Optional object which is passed around middleware and afterware during their execution. |

<a name="Intermediary.series"></a>

### Intermediary.series(intermediaries, target) ⇒ <code>function</code>
Static function which takes a list of intermediaries and 
returns a function which when called executes intermediaries in a sequential manner.

**Kind**: static method of [<code>Intermediary</code>](#Intermediary)  
**Returns**: <code>function</code> - InvolvedFunction Async function which can be invoked to execute all the intermediaries passed
along with the target function.  

| Param | Type |
| --- | --- |
| intermediaries | [<code>Array.&lt;Intermediary&gt;</code>](#Intermediary) | 
| target | <code>function</code> | 

<a name="Intermediary.createMiddleware"></a>

### Intermediary.createMiddleware(fn) ⇒ [<code>Middleware</code>](#Middleware)
Create a middleware out of the provided function.

**Kind**: static method of [<code>Intermediary</code>](#Intermediary)  
**Returns**: [<code>Middleware</code>](#Middleware) - middleware  

| Param | Type |
| --- | --- |
| fn | [<code>CreateMiddlewareCallback</code>](#CreateMiddlewareCallback) | 

<a name="Intermediary.createAfterware"></a>

### Intermediary.createAfterware(fn) ⇒ [<code>Afterware</code>](#Afterware)
Creates a afterware out of the provided function.

**Kind**: static method of [<code>Intermediary</code>](#Intermediary)  
**Returns**: [<code>Afterware</code>](#Afterware) - afterware  

| Param | Type |
| --- | --- |
| fn | [<code>CreateAfterwareCallback</code>](#CreateAfterwareCallback) | 

<a name="Middleware"></a>

## Middleware ⇒ [<code>MiddlewareExecutor</code>](#MiddlewareExecutor)
A middleware function.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| Context | <code>object</code> | The context passed by the involve function |

<a name="Afterware"></a>

## Afterware ⇒ [<code>AfterwareExecutor</code>](#AfterwareExecutor)
An Afterware function.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| Context | <code>object</code> | The context passed by the involve function |

<a name="MiddlewareExecutor"></a>

## MiddlewareExecutor ⇒ [<code>MiddlewareController</code>](#MiddlewareController)
A middleware executor

**Kind**: global typedef  
**Returns**: [<code>MiddlewareController</code>](#MiddlewareController) - The middleware controller.  

| Param | Type | Description |
| --- | --- | --- |
| next | <code>function</code> | the next middleware / target function in the stack. |

<a name="AfterwareExecutor"></a>

## AfterwareExecutor ⇒ [<code>MiddlewareController</code>](#MiddlewareController)
An afterware executor

**Kind**: global typedef  
**Returns**: [<code>MiddlewareController</code>](#MiddlewareController) - The afterware controller.  

| Param | Type | Description |
| --- | --- | --- |
| next | <code>function</code> | the next afterware / target function in the stack. |

<a name="MiddlewareController"></a>

## MiddlewareController ⇒
Middleware Controller
This holds the acutal body of the middleware function.
This function must return the next function's result.
It can be obtained by invoking next function passed on to it by the executor with the arguments this controller got.

**Kind**: global typedef  
**Returns**: next function's result.  

| Type |
| --- |
| <code>args</code> | 

<a name="AfterwareController"></a>

## AfterwareController ⇒
Afterware Controller
This holds the acutal body of the middleware function.
This function must return the next function's result.
It can be obtained by invoking next function passed on to it by the executor with the arguments this controller got.

**Kind**: global typedef  
**Returns**: next function's result.  

| Param | Type | Description |
| --- | --- | --- |
| result |  | the return value of the target function |
| ...finalTargetArgs | <code>args</code> | The args with which the target function was invoked causing it to give the above result. |

<a name="CreateMiddlewareCallback"></a>

## CreateMiddlewareCallback : <code>callback</code>
This callback is the hold the middleware controller logic.
This function must return the next function's result invoked with the arguments it got.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| context |  | The context passed by the involve function. Same as the one the middleware function gets. |
| next |  | the next middleware / target function in the stack. Same as the one the middleware executor gets. |
| ...arg | <code>args</code> | The args which were passed to this middleware. |

<a name="CreateAfterwareCallback"></a>

## CreateAfterwareCallback : <code>callback</code>
This callback is the hold the afterware controller logic.
This function must return the next function's result invoked with the arguments it got.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| context |  | The context passed by the involve function. Same as the one the afterware function gets. |
| next |  | the next afterware / target function in the stack. Same as the one the afterware executor gets. |
| ...arg | <code>args</code> | The args which were passed to this afterware. |

