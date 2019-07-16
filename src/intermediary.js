const convertArgType = require('../utils/convertArgType')

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
 * @type {callback}
 * @typedef CreateMiddlewareCallback
 * @param context The context passed by the involve function. Same as the one the middleware function gets.
 * @param next the next middleware / target function in the stack. Same as the one the middleware executor gets.
 * @param {...args} arg The args which were passed to this middleware.
 */

 /**
 * This callback is the hold the afterware controller logic.
 * This function must return the next function's result invoked with the arguments it got.
 * @type {callback}
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
     * @param {Intermediary[]} intermediaries 
     * @param {function} target 
     * @static
     * @returns {function} InvolvedFunction Async function which can be invoked to execute all the intermediaries passed
     * along with the target function.
     */
    static series(intermediaries, target, context){
        /**
         * Each intermediary can have stacks of multiple middleware and afterware.
         * This function sequentially executes middleware stacks of the intermediaries and then 
         * executes the target function and then executes the afterware stacks of the intermediaries.
         */
        return async (...targetArgs) => {
            let lastIntermediary = [...intermediaries].pop();
            let next
            const fakeTarget = () => {}
            for (const intermediary of intermediaries) {
                if(!(intermediary instanceof Intermediary)){
                    throw new Error('intermediaries should be instances of Intermediary')
                }
                next = intermediary.involve(fakeTarget, context).bind(intermediary)
                next(...targetArgs)
            };
            next = lastIntermediary.involve(target, context).bind(lastIntermediary)
            return next(...targetArgs)
        }
    }

    /**
     * Create a middleware out of the provided function.
     * @param  {CreateMiddlewareCallback} fn 
     * @static
     * @returns {Middleware} middleware
     */
    static createMiddleware(fn){
        return (ctx) => (...targetArgs) => fn(ctx, ...targetArgs)
    }

    /**
     * Creates a afterware out of the provided function.
     * @param {CreateAfterwareCallback} fn 
     * @static
     * @returns {Afterware} afterware
     */
    static createAfterware(fn){
        return (ctx) => (result, ...targetArgs) => fn(ctx, result, ...targetArgs)
    }

    /**
     * Attaches the intermediary's middleware and afterware stack to the 
     * target function and returns and involved function.
     * @param {*} target 
     * @param context Optional object which is passed around middleware and afterware
     * during their execution. 
     * @returns {function} Involved function 
     */
    involve(target, context = {}, throwOnMiddleware) {
        return async (...targetArgs) => {
            let updatedArg = [...targetArgs]
            if(this.middleware){
                let middleware = ([...this.middleware]);
                for (const currentMiddleware of middleware) {
                    try {
                        updatedArg = await currentMiddleware(context)(...updatedArg)
                        updatedArg = convertArgType(updatedArg)
                    } catch (error) {
                        console.log(error)
                        if (!throwOnMiddleware) {
                            return
                        }
                    }
                }
            }
            let result = await target(...updatedArg);

            if(this.afterware){
                let afterware = ([...this.afterware]);
                for (const currentAfterware of afterware) {
                    try {
                        const currentResult = await currentAfterware(context)(result, ...updatedArg)
                        result = currentResult.result
                        updatedArg = convertArgType(currentResult.args)
                    } catch (error) {
                        console.log(error)
                        if (!throwOnMiddleware) {
                            return
                        }
                    }
                }
                return result
            } else {
                return result;
            }

        }
    }
}

    
module.exports = Intermediary;
Intermediary.default = Intermediary;

