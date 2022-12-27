"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
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
var Intermediary = /*#__PURE__*/function () {
  /**
   * Instantiates a new intermediary with the provided middleware and afterware
   * @param {Middleware[]} middleware 
   * @param {Afterware[]} afterware 
   * @constructor
   */
  function Intermediary(middleware, afterware) {
    _classCallCheck(this, Intermediary);
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
  _createClass(Intermediary, [{
    key: "involve",
    value:
    /**
     * Attaches the intermediary's middleware and afterware stack to the 
     * target function and returns and involved function.
     * @param {*} target 
     * @param context Optional object which is passed around middleware and afterware
     * during their execution. 
     * @returns {function} Involved function 
     */
    function involve(target) {
      var _this = this;
      var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return /*#__PURE__*/_asyncToGenerator(function* () {
        var finalTargetArgs = [];
        var next = function next() {
          for (var _len = arguments.length, targetArgs = new Array(_len), _key = 0; _key < _len; _key++) {
            targetArgs[_key] = arguments[_key];
          }
          finalTargetArgs = targetArgs;
          return target.apply(void 0, targetArgs);
        };
        if (_this.middleware) {
          var middleware = _toConsumableArray(_this.middleware).reverse();
          var _iterator = _createForOfIteratorHelper(middleware),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var currentMiddleware = _step.value;
              next = yield currentMiddleware(context)(next);
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        }
        var result = yield next.apply(void 0, arguments);
        if (_this.afterware) {
          var afterware = _toConsumableArray(_this.afterware).reverse();
          next = function next(result) {
            return result;
          };
          var _iterator2 = _createForOfIteratorHelper(afterware),
            _step2;
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var currentAfterware = _step2.value;
              next = yield currentAfterware(context)(next);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
          return next.apply(void 0, [result].concat(_toConsumableArray(finalTargetArgs)));
        } else {
          return result;
        }
      });
    }
  }], [{
    key: "series",
    value: function series(ints, target, context) {
      /**
       * Each intermediary can have stacks of multiple middleware and afterware.
       * This function sequentially executes middleware stacks of the intermediaries and then 
       * executes the target function and then executes the afterware stacks of the intermediaries.
       */
      return /*#__PURE__*/_asyncToGenerator(function* () {
        var valid = ints.every(function (int) {
          return int instanceof Intermediary;
        });
        if (!valid) {
          throw new Error('intermediaries should be instances of Intermediary');
        }
        var intermediaries = _toConsumableArray(ints);
        var lastIntermediary = intermediaries.pop();
        var next = lastIntermediary.involve(target, context).bind(lastIntermediary);
        intermediaries.reverse();
        var _iterator3 = _createForOfIteratorHelper(intermediaries),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var intermediary = _step3.value;
            next = intermediary.involve(next, context).bind(intermediary);
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        ;
        return next.apply(void 0, arguments);
      });
    }

    /**
     * Create a middleware out of the provided function.
     * @param  {CreateMiddlewareCallback} fn 
     * @static
     * @returns {Middleware} middleware
     */
  }, {
    key: "createMiddleware",
    value: function createMiddleware(fn) {
      return function (ctx) {
        return function (next) {
          return function () {
            for (var _len2 = arguments.length, targetArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              targetArgs[_key2] = arguments[_key2];
            }
            return fn.apply(void 0, [ctx, next].concat(targetArgs));
          };
        };
      };
    }

    /**
     * Creates a afterware out of the provided function.
     * @param {CreateAfterwareCallback} fn 
     * @static
     * @returns {Afterware} afterware
     */
  }, {
    key: "createAfterware",
    value: function createAfterware(fn) {
      return function (ctx) {
        return function (next) {
          return function (result) {
            for (var _len3 = arguments.length, targetArgs = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
              targetArgs[_key3 - 1] = arguments[_key3];
            }
            return fn.apply(void 0, [ctx, next, result].concat(targetArgs));
          };
        };
      };
    }
  }]);
  return Intermediary;
}();
module.exports = Intermediary;
Intermediary.default = Intermediary;