// region TYPEDEFS
/**
 * A middleware function.
 * @typedef Middleware
 * @type {function}
 * @param {object} Context The context passed by the involve function
 * @returns {MiddlewareExecutor}
 */

/**
 * An Afterware function.
 * @typedef Afterware
 * @type {function}
 * @param {object} Context The context passed by the involve function
 * @returns {AfterwareExecutor}
 */

/**
  * A middleware executor
  * @typedef MiddlewareExecutor
  * @type {function}
  * @param {function } next the next middleware / target function in the stack.
  * @returns { MiddlewareController } The middleware controller.
  */

/**
  * An afterware executor
  * @typedef AfterwareExecutor
  * @type {function}
  * @param {function} next the next afterware / target function in the stack.
  * @returns { MiddlewareController } The afterware controller.
  */

/**
  * Middleware Controller
  * This holds the acutal body of the middleware function.
  * This function must return the next function's result.
  * It can be obtained by invoking next function passed on to it by the executor with the arguments this controller got.
  * @typedef MiddlewareController
  * @type {function}
  * @param {...args}
  * @return next function's result.
  */
  
/**
  * Afterware Controller
  * This holds the acutal body of the middleware function.
  * This function must return the next function's result.
  * It can be obtained by invoking next function passed on to it by the executor with the arguments this controller got.
  * @typedef AfterwareController
  * @type {function}
  * @param result the return value of the target function
  * @param {...args} finalTargetArgs The args with which the target function was invoked causing it to give the above result.
  * @return next function's result.
  */

/**
 * This callback is the hold the middleware controller logic.
 * This function must return the next function's result invoked with the arguments it got.
 * @type {function}
 * @typedef CreateMiddlewareCallback
 * @param context The context passed by the involve function. Same as the one the middleware function gets.
 * @param next the next middleware / target function in the stack. Same as the one the middleware executor gets.
 * @param {...args} arg The args which were passed to this middleware.
 */

 /**
 * This callback is the hold the afterware controller logic.
 * This function must return the next function's result invoked with the arguments it got.
 * @type {function}
 * @typedef CreateAfterwareCallback
 * @param context The context passed by the involve function. Same as the one the afterware function gets.
 * @param next the next afterware / target function in the stack. Same as the one the afterware executor gets.
 * @param {...args} arg The args which were passed to this afterware.
 */

/**
 * @class Intermediary
 * Intermediary class holds the all the middleware and afterware
 * related to a particular stack of hooks.
 */

// endregion
class Intermediary {
    /**
     * Instantiates a new intermediary with the provided middleware and afterware
     * @param {Middleware[]} middleware 
     * @param {Afterware[]} afterware 
     * @constructor
     */
    constructor(middleware, afterware) {
        this.middleware = middleware;
        this.afterware = afterware;
    }

    /**
     * Static function which takes a list of intermediaries and 
     * returns a function which when called executes intermediaries in a sequential manner.
     * Each intermediary can have stacks of multiple middleware and afterware.
     * This function sequentially executes middleware stacks of the intermediaries and then 
     * executes the target function and then executes the afterware stacks of the intermediaries.
     * @param {Intermediary[]} intermediaries 
     * @param {function} target 
     * @static
     * @returns {function} InvolvedFunction Async function which can be invoked to execute all the intermediaries passed
     * along with the target function.
     */
    static series(intermediaries, target){
        return async (...targetArgs) => {
            let lastIntermediary = intermediaries.pop();
            let next = lastIntermediary.involve(target).bind(lastIntermediary);
            intermediaries.reverse();
            for (const intermediary of intermediaries) {
                if(!(intermediary instanceof Intermediary)){
                    throw new Error('intermediaries should be instances of Intermediary')
                } 
                next = intermediary.involve(next).bind(intermediary)
            };
            return next(...targetArgs)
        }
    }

    /**
     * Create a middleware out of the provided function.
     * Middlewares should have the following signature
     * (ctx) => (next) => (...args) => { Middleware-controller-logic }.
     * Writing functions in this manner could be cumbersome.
     * Passing a function which takes (ctx, next, ...targetArgs) as arguments 
     * will be cleaner way to construct middleware.
     * The fn should return next(...args) when it is done.
     * @param  {CreateMiddlewareCallback} fn 
     * @static
     * @returns {Middleware} middleware
     */
    static createMiddleware(fn){
        return (ctx) => (next) => (...targetArgs) => fn(ctx, next, ...targetArgs)
    }

    /**
     * Creates a afterware out of the provided function.
     * Afterware should be in the following signature.
     * (ctx) => (next) => (result, ...targetArgs) => { Afterware-controller-logic }
     * Writing functions in this manner could be cumbersome.
     * Passing a function which takes (ctx, next, result, ...targetArgs) as arguments 
     * will be cleaner way to construct middleware.
     * Result will be the return value of the target function on which this intermediary was involved.
     * Target Args will be actual arguments by which the target function was invoked.
     * These might be different from the one's passed to the involved function as the middleware
     * will be able to modify the arguments.
     * The fn should return next(result, ...targetArgs) when done.
     * @param {CreateMiddlewareCallback} fn 
     * @static
     * @returns {Afterware} afterware
     */
    static createAfterware(fn){
        return (ctx) => (next) => (result, ...targetArgs) => fn(ctx, next, result, ...targetArgs)
    }

    /**
     * Attaches the intermediary's middleware and afterware stack to the 
     * target function and returns and involved function.
     * The implementation is hugely inspired from redux's middleware implementation.
     * Calling the involved function will actually trigger the execution of the 
     * middleware, target, afterware in that order.
     * The returned function will be an async function.
     * @param {*} target 
     * @param context Optional object which is passed around middleware and afterware
     * during their execution. 
     * @returns {function} Involved function 
     */
    involve(target, context = {}) {
        return async (...targetArgs) => {
            let finalTargetArgs = [];
            let next = (...targetArgs) => {
                finalTargetArgs = targetArgs;
                return target(...targetArgs);
            };
            if(this.middleware){
                let middleware = this.middleware.reverse();
                for (const currentMiddleware of middleware) {
                    next = await currentMiddleware(context)(next)
                }
            }
            let result = await next(...targetArgs);

            if(this.afterware){
                let afterware = this.afterware.reverse();
                next = (result) => result;
                for (const currentAfterware of afterware) {
                    next = await currentAfterware(context)(next)
                }
                return next(result, ...finalTargetArgs);
            } else {
                return result;
            }

        }
    }
}

    
module.exports = Intermediary;
Intermediary.default = Intermediary;

