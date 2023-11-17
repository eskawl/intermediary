"use strict";

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
  static series(ints, target, context) {
    /**
     * Each intermediary can have stacks of multiple middleware and afterware.
     * This function sequentially executes middleware stacks of the intermediaries and then 
     * executes the target function and then executes the afterware stacks of the intermediaries.
     */
    return async function () {
      let valid = ints.every(int => {
        return int instanceof Intermediary;
      });
      if (!valid) {
        throw new Error('intermediaries should be instances of Intermediary');
      }
      let intermediaries = [...ints];
      let lastIntermediary = intermediaries.pop();
      let next = lastIntermediary.involve(target, context).bind(lastIntermediary);
      intermediaries.reverse();
      for (const intermediary of intermediaries) {
        next = intermediary.involve(next, context).bind(intermediary);
      }
      ;
      return next(...arguments);
    };
  }

  /**
   * Create a middleware out of the provided function.
   * @param  {CreateMiddlewareCallback} fn 
   * @static
   * @returns {Middleware} middleware
   */
  static createMiddleware(fn) {
    return ctx => next => function () {
      for (var _len = arguments.length, targetArgs = new Array(_len), _key = 0; _key < _len; _key++) {
        targetArgs[_key] = arguments[_key];
      }
      return fn(ctx, next, ...targetArgs);
    };
  }

  /**
   * Creates a afterware out of the provided function.
   * @param {CreateAfterwareCallback} fn 
   * @static
   * @returns {Afterware} afterware
   */
  static createAfterware(fn) {
    return ctx => next => function (result) {
      for (var _len2 = arguments.length, targetArgs = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        targetArgs[_key2 - 1] = arguments[_key2];
      }
      return fn(ctx, next, result, ...targetArgs);
    };
  }

  /**
   * Attaches the intermediary's middleware and afterware stack to the 
   * target function and returns and involved function.
   * @param {*} target 
   * @param context Optional object which is passed around middleware and afterware
   * during their execution. 
   * @returns {function} Involved function 
   */
  involve(target) {
    var _this = this;
    let context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return async function () {
      let finalTargetArgs = [];
      let next = function () {
        for (var _len3 = arguments.length, targetArgs = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          targetArgs[_key3] = arguments[_key3];
        }
        finalTargetArgs = targetArgs;
        return target(...targetArgs);
      };
      if (_this.middleware) {
        let middleware = [..._this.middleware].reverse();
        for (const currentMiddleware of middleware) {
          next = await currentMiddleware(context)(next);
        }
      }
      let result = await next(...arguments);
      if (_this.afterware) {
        let afterware = [..._this.afterware].reverse();
        next = result => result;
        for (const currentAfterware of afterware) {
          next = await currentAfterware(context)(next);
        }
        return next(result, ...finalTargetArgs);
      } else {
        return result;
      }
    };
  }
}
module.exports = Intermediary;
Intermediary.default = Intermediary;