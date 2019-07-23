## Classes

<dl>
<dt><a href="#Intermediary">Intermediary</a></dt>
<dd><p>Intermediary
Intermediary class holds the all the middleware and afterware
related to a particular stack of hooks.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Middleware">Middleware</a> ⇒ <code><a href="#MiddlewareController">MiddlewareController</a></code></dt>
<dd><p>A middleware function.</p>
</dd>
<dt><a href="#Afterware">Afterware</a> ⇒ <code><a href="#AfterwareController">AfterwareController</a></code></dt>
<dd><p>An Afterware function.</p>
</dd>
<dt><a href="#MiddlewareController">MiddlewareController</a> ⇒</dt>
<dd><p>Middleware Controller
This holds the acutal body of the middleware function.
This function must return the next function&#39;s result.
It can be obtained by returning the arguments this controller got, in an array.</p>
</dd>
<dt><a href="#AfterwareController">AfterwareController</a> ⇒</dt>
<dd><p>Afterware Controller
This holds the acutal body of the middleware function.
This function must return the next function&#39;s result.
It can be obtained by returning the arguments this controller got, in an array.</p>
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
Intermediary
Intermediary class holds the all the middleware and afterware
related to a particular stack of hooks.

**Kind**: global class  

* [Intermediary](#Intermediary)
    * [new Intermediary(middleware, afterware)](#new_Intermediary_new)
    * _instance_
        * [.involve(target, context, providedConfig)](#Intermediary+involve) ⇒ <code>function</code>
    * _static_
        * [.series(intermediaries, target, context, providedConfig)](#Intermediary.series) ⇒ <code>function</code>
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

### intermediary.involve(target, context, providedConfig) ⇒ <code>function</code>
Attaches the intermediary's middleware and afterware stack to the 
target function and returns and involved function.

**Kind**: instance method of [<code>Intermediary</code>](#Intermediary)  
**Returns**: <code>function</code> - Involved function  

| Param | Type | Description |
| --- | --- | --- |
| target | <code>\*</code> |  |
| context |  | Optional object which is passed around middleware and afterware during their execution. |
| providedConfig |  | Optional object which can be passed to ignore the errors that  occurs during the execution of middleware, target function and afterware |

<a name="Intermediary.series"></a>

### Intermediary.series(intermediaries, target, context, providedConfig) ⇒ <code>function</code>
Static function which takes a list of intermediaries and 
returns a function which when called executes intermediaries in a sequential manner.

**Kind**: static method of [<code>Intermediary</code>](#Intermediary)  
**Returns**: <code>function</code> - InvolvedFunction Async function which can be invoked to execute all the intermediaries passed
along with the target function.  

| Param | Type | Description |
| --- | --- | --- |
| intermediaries | [<code>Array.&lt;Intermediary&gt;</code>](#Intermediary) |  |
| target | <code>function</code> |  |
| context |  | Optional object which is passed around middleware and afterware during their execution. |
| providedConfig |  | Optional object which can be passed to ignore the errors that  occurs during the execution of middleware, target function and afterware |

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

## Middleware ⇒ [<code>MiddlewareController</code>](#MiddlewareController)
A middleware function.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| Context | <code>object</code> | The context passed by the involve function |

<a name="Afterware"></a>

## Afterware ⇒ [<code>AfterwareController</code>](#AfterwareController)
An Afterware function.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| Context | <code>object</code> | The context passed by the involve function |

<a name="MiddlewareController"></a>

## MiddlewareController ⇒
Middleware Controller
This holds the acutal body of the middleware function.
This function must return the next function's result.
It can be obtained by returning the arguments this controller got, in an array.

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
It can be obtained by returning the arguments this controller got, in an array.

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
| ...arg | <code>args</code> | The args which were passed to this middleware. |

<a name="CreateAfterwareCallback"></a>

## CreateAfterwareCallback : <code>callback</code>
This callback is the hold the afterware controller logic.
This function must return the next function's result invoked with the arguments it got.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| context |  | The context passed by the involve function. Same as the one the afterware function gets. |
| ...arg | <code>args</code> | The args which were passed to this afterware. |

