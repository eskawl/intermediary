"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Intermediary =
/*#__PURE__*/
function () {
  function Intermediary(middleware, afterware) {
    _classCallCheck(this, Intermediary);

    this.middleware = middleware;
    this.afterware = afterware;
  }

  _createClass(Intermediary, [{
    key: "involve",
    value: function involve(target) {
      var _this = this;

      var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return (
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          var finalTargetArgs = [];

          var next = function next() {
            for (var _len = arguments.length, targetArgs = new Array(_len), _key = 0; _key < _len; _key++) {
              targetArgs[_key] = arguments[_key];
            }

            finalTargetArgs = targetArgs;
            return target.apply(void 0, targetArgs);
          };

          if (_this.middleware) {
            var middleware = _this.middleware.reverse();

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = middleware[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var currentMiddleware = _step.value;
                next = yield currentMiddleware(context)(next);
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }
          }

          var result = yield next.apply(void 0, arguments);

          if (_this.afterware) {
            var afterware = _this.afterware.reverse();

            next = function next(result) {
              return result;
            };

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = afterware[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var currentAfterware = _step2.value;
                next = yield currentAfterware(context)(next);
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                  _iterator2.return();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }

            return next.apply(void 0, [result].concat(_toConsumableArray(finalTargetArgs)));
          } else {
            return result;
          }
        })
      );
    }
  }], [{
    key: "series",
    value: function series(intermediaries, target) {
      return (
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          var lastIntermediary = intermediaries.pop();
          var next = lastIntermediary.involve(target).bind(lastIntermediary);
          intermediaries.reverse();
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = intermediaries[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var intermediary = _step3.value;

              if (!(intermediary instanceof Intermediary)) {
                throw new Error('intermediaries should be instances of Intermediary');
              }

              next = intermediary.involve(next).bind(intermediary);
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }

          ;
          return next.apply(void 0, arguments);
        })
      );
    }
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

var _default = Intermediary;
exports.default = _default;