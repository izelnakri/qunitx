(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
  var __commonJS = (cb, mod) => () => (mod || cb((mod = {exports: {}}).exports, mod), mod.exports);
  var __reExport = (target, module2, desc) => {
    if (module2 && typeof module2 === "object" || typeof module2 === "function") {
      for (let key of __getOwnPropNames(module2))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
    }
    return target;
  };
  var __toModule = (module2) => {
    return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
  };

  // ../../vendor/qunit.js
  var require_qunit = __commonJS((exports, module2) => {
    /*!
     * QUnit 2.15.0
     * https://qunitjs.com/
     *
     * Copyright OpenJS Foundation and other contributors
     * Released under the MIT license
     * https://jquery.org/license
     */
    (function() {
      "use strict";
      var Map = typeof Map === "function" ? Map : function StringMap() {
        var store = Object.create(null);
        this.get = function(strKey) {
          return store[strKey];
        };
        this.set = function(strKey, val) {
          store[strKey] = val;
          return this;
        };
        this.clear = function() {
          store = Object.create(null);
        };
      };
      function _typeof(obj) {
        "@babel/helpers - typeof";
        if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
          _typeof = function(obj2) {
            return typeof obj2;
          };
        } else {
          _typeof = function(obj2) {
            return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
          };
        }
        return _typeof(obj);
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps)
          _defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          _defineProperties(Constructor, staticProps);
        return Constructor;
      }
      function _toConsumableArray(arr) {
        return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
      }
      function _arrayWithoutHoles(arr) {
        if (Array.isArray(arr))
          return _arrayLikeToArray(arr);
      }
      function _iterableToArray(iter) {
        if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter))
          return Array.from(iter);
      }
      function _unsupportedIterableToArray(o, minLen) {
        if (!o)
          return;
        if (typeof o === "string")
          return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor)
          n = o.constructor.name;
        if (n === "Map" || n === "Set")
          return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
          return _arrayLikeToArray(o, minLen);
      }
      function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length)
          len = arr.length;
        for (var i = 0, arr2 = new Array(len); i < len; i++)
          arr2[i] = arr[i];
        return arr2;
      }
      function _nonIterableSpread() {
        throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }
      function _createForOfIteratorHelper(o, allowArrayLike) {
        var it;
        if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
          if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
            if (it)
              o = it;
            var i = 0;
            var F = function() {
            };
            return {
              s: F,
              n: function() {
                if (i >= o.length)
                  return {
                    done: true
                  };
                return {
                  done: false,
                  value: o[i++]
                };
              },
              e: function(e) {
                throw e;
              },
              f: F
            };
          }
          throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }
        var normalCompletion = true, didErr = false, err;
        return {
          s: function() {
            it = o[Symbol.iterator]();
          },
          n: function() {
            var step = it.next();
            normalCompletion = step.done;
            return step;
          },
          e: function(e) {
            didErr = true;
            err = e;
          },
          f: function() {
            try {
              if (!normalCompletion && it.return != null)
                it.return();
            } finally {
              if (didErr)
                throw err;
            }
          }
        };
      }
      var foundGlobalThis;
      (function(Object2) {
        if ((typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) === "object") {
          foundGlobalThis = globalThis;
        } else {
          var get = function get2() {
            foundGlobalThis = this || self;
            delete Object2.prototype._T_;
          };
          this ? get() : (Object2.defineProperty(Object2.prototype, "_T_", {
            configurable: true,
            get
          }), _T_);
        }
      })(Object);
      var globalThis$1 = foundGlobalThis;
      var window$1 = globalThis$1.window;
      var self$1 = globalThis$1.self;
      var console$1 = globalThis$1.console;
      var setTimeout$1 = globalThis$1.setTimeout;
      var clearTimeout = globalThis$1.clearTimeout;
      var document = window$1 && window$1.document;
      var navigator = window$1 && window$1.navigator;
      var localSessionStorage = function() {
        var x = "qunit-test-string";
        try {
          globalThis$1.sessionStorage.setItem(x, x);
          globalThis$1.sessionStorage.removeItem(x);
          return globalThis$1.sessionStorage;
        } catch (e) {
          return void 0;
        }
      }();
      var Logger = {
        warn: console$1 ? (console$1.warn || console$1.log).bind(console$1) : function() {
        }
      };
      var toString = Object.prototype.toString;
      var hasOwn = Object.prototype.hasOwnProperty;
      var now = Date.now || function() {
        return new Date().getTime();
      };
      var nativePerf = getNativePerf();
      function getNativePerf() {
        if (window$1 && typeof window$1.performance !== "undefined" && typeof window$1.performance.mark === "function" && typeof window$1.performance.measure === "function") {
          return window$1.performance;
        } else {
          return void 0;
        }
      }
      var performance = {
        now: nativePerf ? nativePerf.now.bind(nativePerf) : now,
        measure: nativePerf ? function(comment, startMark, endMark) {
          try {
            nativePerf.measure(comment, startMark, endMark);
          } catch (ex) {
            Logger.warn("performance.measure could not be executed because of ", ex.message);
          }
        } : function() {
        },
        mark: nativePerf ? nativePerf.mark.bind(nativePerf) : function() {
        }
      };
      function diff2(a, b) {
        var result = a.slice();
        for (var i = 0; i < result.length; i++) {
          for (var j = 0; j < b.length; j++) {
            if (result[i] === b[j]) {
              result.splice(i, 1);
              i--;
              break;
            }
          }
        }
        return result;
      }
      function inArray(elem, array) {
        return array.indexOf(elem) !== -1;
      }
      function objectValues(obj) {
        var vals = is2("array", obj) ? [] : {};
        for (var key in obj) {
          if (hasOwn.call(obj, key)) {
            var val = obj[key];
            vals[key] = val === Object(val) ? objectValues(val) : val;
          }
        }
        return vals;
      }
      function extend2(a, b, undefOnly) {
        for (var prop in b) {
          if (hasOwn.call(b, prop)) {
            if (b[prop] === void 0) {
              delete a[prop];
            } else if (!(undefOnly && typeof a[prop] !== "undefined")) {
              a[prop] = b[prop];
            }
          }
        }
        return a;
      }
      function objectType2(obj) {
        if (typeof obj === "undefined") {
          return "undefined";
        }
        if (obj === null) {
          return "null";
        }
        var match = toString.call(obj).match(/^\[object\s(.*)\]$/);
        var type = match && match[1];
        switch (type) {
          case "Number":
            if (isNaN(obj)) {
              return "nan";
            }
            return "number";
          case "String":
          case "Boolean":
          case "Array":
          case "Set":
          case "Map":
          case "Date":
          case "RegExp":
          case "Function":
          case "Symbol":
            return type.toLowerCase();
          default:
            return _typeof(obj);
        }
      }
      function is2(type, obj) {
        return objectType2(obj) === type;
      }
      function generateHash(module3, testName) {
        var str = module3 + "" + testName;
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
          hash = (hash << 5) - hash + str.charCodeAt(i);
          hash |= 0;
        }
        var hex = (4294967296 + hash).toString(16);
        if (hex.length < 8) {
          hex = "0000000" + hex;
        }
        return hex.slice(-8);
      }
      var equiv2 = function() {
        var pairs = [];
        var getProto = Object.getPrototypeOf || function(obj) {
          return obj.__proto__;
        };
        function useStrictEquality(a, b) {
          if (_typeof(a) === "object") {
            a = a.valueOf();
          }
          if (_typeof(b) === "object") {
            b = b.valueOf();
          }
          return a === b;
        }
        function compareConstructors(a, b) {
          var protoA = getProto(a);
          var protoB = getProto(b);
          if (a.constructor === b.constructor) {
            return true;
          }
          if (protoA && protoA.constructor === null) {
            protoA = null;
          }
          if (protoB && protoB.constructor === null) {
            protoB = null;
          }
          if (protoA === null && protoB === Object.prototype || protoB === null && protoA === Object.prototype) {
            return true;
          }
          return false;
        }
        function getRegExpFlags(regexp) {
          return "flags" in regexp ? regexp.flags : regexp.toString().match(/[gimuy]*$/)[0];
        }
        function isContainer(val) {
          return ["object", "array", "map", "set"].indexOf(objectType2(val)) !== -1;
        }
        function breadthFirstCompareChild(a, b) {
          if (a === b) {
            return true;
          }
          if (!isContainer(a)) {
            return typeEquiv(a, b);
          }
          if (pairs.every(function(pair) {
            return pair.a !== a || pair.b !== b;
          })) {
            pairs.push({
              a,
              b
            });
          }
          return true;
        }
        var callbacks = {
          string: useStrictEquality,
          boolean: useStrictEquality,
          number: useStrictEquality,
          null: useStrictEquality,
          undefined: useStrictEquality,
          symbol: useStrictEquality,
          date: useStrictEquality,
          nan: function nan() {
            return true;
          },
          regexp: function regexp(a, b) {
            return a.source === b.source && getRegExpFlags(a) === getRegExpFlags(b);
          },
          function: function _function() {
            return false;
          },
          array: function array(a, b) {
            var len = a.length;
            if (len !== b.length) {
              return false;
            }
            for (var i = 0; i < len; i++) {
              if (!breadthFirstCompareChild(a[i], b[i])) {
                return false;
              }
            }
            return true;
          },
          set: function set(a, b) {
            if (a.size !== b.size) {
              return false;
            }
            var outerEq = true;
            a.forEach(function(aVal) {
              if (!outerEq) {
                return;
              }
              var innerEq = false;
              b.forEach(function(bVal) {
                if (innerEq) {
                  return;
                }
                var parentPairs = pairs;
                if (innerEquiv(bVal, aVal)) {
                  innerEq = true;
                }
                pairs = parentPairs;
              });
              if (!innerEq) {
                outerEq = false;
              }
            });
            return outerEq;
          },
          map: function map(a, b) {
            if (a.size !== b.size) {
              return false;
            }
            var outerEq = true;
            a.forEach(function(aVal, aKey) {
              if (!outerEq) {
                return;
              }
              var innerEq = false;
              b.forEach(function(bVal, bKey) {
                if (innerEq) {
                  return;
                }
                var parentPairs = pairs;
                if (innerEquiv([bVal, bKey], [aVal, aKey])) {
                  innerEq = true;
                }
                pairs = parentPairs;
              });
              if (!innerEq) {
                outerEq = false;
              }
            });
            return outerEq;
          },
          object: function object(a, b) {
            if (compareConstructors(a, b) === false) {
              return false;
            }
            var aProperties = [];
            var bProperties = [];
            for (var i in a) {
              aProperties.push(i);
              if (a.constructor !== Object && typeof a.constructor !== "undefined" && typeof a[i] === "function" && typeof b[i] === "function" && a[i].toString() === b[i].toString()) {
                continue;
              }
              if (!breadthFirstCompareChild(a[i], b[i])) {
                return false;
              }
            }
            for (var _i in b) {
              bProperties.push(_i);
            }
            return typeEquiv(aProperties.sort(), bProperties.sort());
          }
        };
        function typeEquiv(a, b) {
          var type = objectType2(a);
          return objectType2(b) === type && callbacks[type](a, b);
        }
        function innerEquiv(a, b) {
          if (arguments.length < 2) {
            return true;
          }
          pairs = [{
            a,
            b
          }];
          for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            if (pair.a !== pair.b && !typeEquiv(pair.a, pair.b)) {
              return false;
            }
          }
          return arguments.length === 2 || innerEquiv.apply(this, [].slice.call(arguments, 1));
        }
        return function() {
          var result = innerEquiv.apply(void 0, arguments);
          pairs.length = 0;
          return result;
        };
      }();
      var config2 = {
        queue: [],
        blocking: true,
        reorder: true,
        altertitle: true,
        collapse: true,
        scrolltop: true,
        maxDepth: 5,
        requireExpects: false,
        urlConfig: [],
        modules: [],
        currentModule: {
          name: "",
          tests: [],
          childModules: [],
          testsRun: 0,
          testsIgnored: 0,
          hooks: {
            before: [],
            beforeEach: [],
            afterEach: [],
            after: []
          }
        },
        callbacks: {},
        storage: localSessionStorage
      };
      var globalConfig = window$1 && window$1.QUnit && window$1.QUnit.config;
      if (window$1 && window$1.QUnit && !window$1.QUnit.version) {
        extend2(config2, globalConfig);
      }
      config2.modules.push(config2.currentModule);
      var dump2 = function() {
        function quote(str) {
          return '"' + str.toString().replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
        }
        function literal(o) {
          return o + "";
        }
        function join(pre, arr, post) {
          var s = dump3.separator();
          var inner = dump3.indent(1);
          if (arr.join) {
            arr = arr.join("," + s + inner);
          }
          if (!arr) {
            return pre + post;
          }
          var base = dump3.indent();
          return [pre, inner + arr, base + post].join(s);
        }
        function array(arr, stack2) {
          if (dump3.maxDepth && dump3.depth > dump3.maxDepth) {
            return "[object Array]";
          }
          this.up();
          var i = arr.length;
          var ret = new Array(i);
          while (i--) {
            ret[i] = this.parse(arr[i], void 0, stack2);
          }
          this.down();
          return join("[", ret, "]");
        }
        function isArray(obj) {
          return toString.call(obj) === "[object Array]" || typeof obj.length === "number" && obj.item !== void 0 && (obj.length ? obj.item(0) === obj[0] : obj.item(0) === null && obj[0] === void 0);
        }
        var reName = /^function (\w+)/;
        var dump3 = {
          parse: function parse(obj, objType, stack2) {
            stack2 = stack2 || [];
            var objIndex = stack2.indexOf(obj);
            if (objIndex !== -1) {
              return "recursion(".concat(objIndex - stack2.length, ")");
            }
            objType = objType || this.typeOf(obj);
            var parser = this.parsers[objType];
            var parserType = _typeof(parser);
            if (parserType === "function") {
              stack2.push(obj);
              var res = parser.call(this, obj, stack2);
              stack2.pop();
              return res;
            }
            return parserType === "string" ? parser : this.parsers.error;
          },
          typeOf: function typeOf(obj) {
            var type;
            if (obj === null) {
              type = "null";
            } else if (typeof obj === "undefined") {
              type = "undefined";
            } else if (is2("regexp", obj)) {
              type = "regexp";
            } else if (is2("date", obj)) {
              type = "date";
            } else if (is2("function", obj)) {
              type = "function";
            } else if (obj.setInterval !== void 0 && obj.document !== void 0 && obj.nodeType === void 0) {
              type = "window";
            } else if (obj.nodeType === 9) {
              type = "document";
            } else if (obj.nodeType) {
              type = "node";
            } else if (isArray(obj)) {
              type = "array";
            } else if (obj.constructor === Error.prototype.constructor) {
              type = "error";
            } else {
              type = _typeof(obj);
            }
            return type;
          },
          separator: function separator() {
            if (this.multiline) {
              return this.HTML ? "<br />" : "\n";
            } else {
              return this.HTML ? "&#160;" : " ";
            }
          },
          indent: function indent(extra) {
            if (!this.multiline) {
              return "";
            }
            var chr = this.indentChar;
            if (this.HTML) {
              chr = chr.replace(/\t/g, "   ").replace(/ /g, "&#160;");
            }
            return new Array(this.depth + (extra || 0)).join(chr);
          },
          up: function up(a) {
            this.depth += a || 1;
          },
          down: function down(a) {
            this.depth -= a || 1;
          },
          setParser: function setParser(name, parser) {
            this.parsers[name] = parser;
          },
          quote,
          literal,
          join,
          depth: 1,
          maxDepth: config2.maxDepth,
          parsers: {
            window: "[Window]",
            document: "[Document]",
            error: function error(_error) {
              return 'Error("' + _error.message + '")';
            },
            unknown: "[Unknown]",
            null: "null",
            undefined: "undefined",
            function: function _function(fn) {
              var ret = "function";
              var name = "name" in fn ? fn.name : (reName.exec(fn) || [])[1];
              if (name) {
                ret += " " + name;
              }
              ret += "(";
              ret = [ret, dump3.parse(fn, "functionArgs"), "){"].join("");
              return join(ret, dump3.parse(fn, "functionCode"), "}");
            },
            array,
            nodelist: array,
            arguments: array,
            object: function object(map, stack2) {
              var ret = [];
              if (dump3.maxDepth && dump3.depth > dump3.maxDepth) {
                return "[object Object]";
              }
              dump3.up();
              var keys = [];
              for (var key in map) {
                keys.push(key);
              }
              var nonEnumerableProperties = ["message", "name"];
              for (var i in nonEnumerableProperties) {
                var _key = nonEnumerableProperties[i];
                if (_key in map && !inArray(_key, keys)) {
                  keys.push(_key);
                }
              }
              keys.sort();
              for (var _i = 0; _i < keys.length; _i++) {
                var _key2 = keys[_i];
                var val = map[_key2];
                ret.push(dump3.parse(_key2, "key") + ": " + dump3.parse(val, void 0, stack2));
              }
              dump3.down();
              return join("{", ret, "}");
            },
            node: function node(_node) {
              var open = dump3.HTML ? "&lt;" : "<";
              var close = dump3.HTML ? "&gt;" : ">";
              var tag = _node.nodeName.toLowerCase();
              var ret = open + tag;
              var attrs = _node.attributes;
              if (attrs) {
                for (var i = 0, len = attrs.length; i < len; i++) {
                  var val = attrs[i].nodeValue;
                  if (val && val !== "inherit") {
                    ret += " " + attrs[i].nodeName + "=" + dump3.parse(val, "attribute");
                  }
                }
              }
              ret += close;
              if (_node.nodeType === 3 || _node.nodeType === 4) {
                ret += _node.nodeValue;
              }
              return ret + open + "/" + tag + close;
            },
            functionArgs: function functionArgs(fn) {
              var l = fn.length;
              if (!l) {
                return "";
              }
              var args = new Array(l);
              while (l--) {
                args[l] = String.fromCharCode(97 + l);
              }
              return " " + args.join(", ") + " ";
            },
            key: quote,
            functionCode: "[code]",
            attribute: quote,
            string: quote,
            date: quote,
            regexp: literal,
            number: literal,
            boolean: literal,
            symbol: function symbol(sym) {
              return sym.toString();
            }
          },
          HTML: false,
          indentChar: "  ",
          multiline: true
        };
        return dump3;
      }();
      var SuiteReport = /* @__PURE__ */ function() {
        function SuiteReport2(name, parentSuite) {
          _classCallCheck(this, SuiteReport2);
          this.name = name;
          this.fullName = parentSuite ? parentSuite.fullName.concat(name) : [];
          this.tests = [];
          this.childSuites = [];
          if (parentSuite) {
            parentSuite.pushChildSuite(this);
          }
        }
        _createClass(SuiteReport2, [{
          key: "start",
          value: function start2(recordTime) {
            if (recordTime) {
              this._startTime = performance.now();
              var suiteLevel = this.fullName.length;
              performance.mark("qunit_suite_".concat(suiteLevel, "_start"));
            }
            return {
              name: this.name,
              fullName: this.fullName.slice(),
              tests: this.tests.map(function(test3) {
                return test3.start();
              }),
              childSuites: this.childSuites.map(function(suite) {
                return suite.start();
              }),
              testCounts: {
                total: this.getTestCounts().total
              }
            };
          }
        }, {
          key: "end",
          value: function end(recordTime) {
            if (recordTime) {
              this._endTime = performance.now();
              var suiteLevel = this.fullName.length;
              var suiteName = this.fullName.join(" \u2013 ");
              performance.mark("qunit_suite_".concat(suiteLevel, "_end"));
              performance.measure(suiteLevel === 0 ? "QUnit Test Run" : "QUnit Test Suite: ".concat(suiteName), "qunit_suite_".concat(suiteLevel, "_start"), "qunit_suite_".concat(suiteLevel, "_end"));
            }
            return {
              name: this.name,
              fullName: this.fullName.slice(),
              tests: this.tests.map(function(test3) {
                return test3.end();
              }),
              childSuites: this.childSuites.map(function(suite) {
                return suite.end();
              }),
              testCounts: this.getTestCounts(),
              runtime: this.getRuntime(),
              status: this.getStatus()
            };
          }
        }, {
          key: "pushChildSuite",
          value: function pushChildSuite(suite) {
            this.childSuites.push(suite);
          }
        }, {
          key: "pushTest",
          value: function pushTest(test3) {
            this.tests.push(test3);
          }
        }, {
          key: "getRuntime",
          value: function getRuntime() {
            return this._endTime - this._startTime;
          }
        }, {
          key: "getTestCounts",
          value: function getTestCounts() {
            var counts = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {
              passed: 0,
              failed: 0,
              skipped: 0,
              todo: 0,
              total: 0
            };
            counts = this.tests.reduce(function(counts2, test3) {
              if (test3.valid) {
                counts2[test3.getStatus()]++;
                counts2.total++;
              }
              return counts2;
            }, counts);
            return this.childSuites.reduce(function(counts2, suite) {
              return suite.getTestCounts(counts2);
            }, counts);
          }
        }, {
          key: "getStatus",
          value: function getStatus() {
            var _this$getTestCounts = this.getTestCounts(), total = _this$getTestCounts.total, failed = _this$getTestCounts.failed, skipped = _this$getTestCounts.skipped, todo2 = _this$getTestCounts.todo;
            if (failed) {
              return "failed";
            } else {
              if (skipped === total) {
                return "skipped";
              } else if (todo2 === total) {
                return "todo";
              } else {
                return "passed";
              }
            }
          }
        }]);
        return SuiteReport2;
      }();
      var moduleStack = [];
      function isParentModuleInQueue() {
        var modulesInQueue = config2.modules.map(function(module3) {
          return module3.moduleId;
        });
        return moduleStack.some(function(module3) {
          return modulesInQueue.includes(module3.moduleId);
        });
      }
      function createModule(name, testEnvironment, modifiers) {
        var parentModule = moduleStack.length ? moduleStack.slice(-1)[0] : null;
        var moduleName = parentModule !== null ? [parentModule.name, name].join(" > ") : name;
        var parentSuite = parentModule ? parentModule.suiteReport : globalSuite;
        var skip2 = parentModule !== null && parentModule.skip || modifiers.skip;
        var todo2 = parentModule !== null && parentModule.todo || modifiers.todo;
        var module3 = {
          name: moduleName,
          parentModule,
          tests: [],
          moduleId: generateHash(moduleName),
          testsRun: 0,
          testsIgnored: 0,
          childModules: [],
          suiteReport: new SuiteReport(name, parentSuite),
          skip: skip2,
          todo: skip2 ? false : todo2,
          ignored: modifiers.ignored || false
        };
        var env = {};
        if (parentModule) {
          parentModule.childModules.push(module3);
          extend2(env, parentModule.testEnvironment);
        }
        extend2(env, testEnvironment);
        module3.testEnvironment = env;
        config2.modules.push(module3);
        return module3;
      }
      function processModule(name, options, executeNow) {
        var modifiers = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
        if (objectType2(options) === "function") {
          executeNow = options;
          options = void 0;
        }
        var module3 = createModule(name, options, modifiers);
        var testEnvironment = module3.testEnvironment;
        var hooks = module3.hooks = {};
        setHookFromEnvironment(hooks, testEnvironment, "before");
        setHookFromEnvironment(hooks, testEnvironment, "beforeEach");
        setHookFromEnvironment(hooks, testEnvironment, "afterEach");
        setHookFromEnvironment(hooks, testEnvironment, "after");
        var moduleFns = {
          before: setHookFunction(module3, "before"),
          beforeEach: setHookFunction(module3, "beforeEach"),
          afterEach: setHookFunction(module3, "afterEach"),
          after: setHookFunction(module3, "after")
        };
        var currentModule = config2.currentModule;
        if (objectType2(executeNow) === "function") {
          moduleStack.push(module3);
          config2.currentModule = module3;
          executeNow.call(module3.testEnvironment, moduleFns);
          moduleStack.pop();
          module3 = module3.parentModule || currentModule;
        }
        config2.currentModule = module3;
        function setHookFromEnvironment(hooks2, environment, name2) {
          var potentialHook = environment[name2];
          hooks2[name2] = typeof potentialHook === "function" ? [potentialHook] : [];
          delete environment[name2];
        }
        function setHookFunction(module4, hookName) {
          return function setHook(callback) {
            if (config2.currentModule !== module4) {
              Logger.warn("The `" + hookName + "` hook was called inside the wrong module. Instead, use hooks provided by the callback to the containing module.This will become an error in QUnit 3.0.");
            }
            module4.hooks[hookName].push(callback);
          };
        }
      }
      var focused$1 = false;
      function module$1(name, options, executeNow) {
        var ignored = focused$1 && !isParentModuleInQueue();
        processModule(name, options, executeNow, {
          ignored
        });
      }
      module$1.only = function() {
        if (!focused$1) {
          config2.modules.length = 0;
          config2.queue.length = 0;
        }
        processModule.apply(void 0, arguments);
        focused$1 = true;
      };
      module$1.skip = function(name, options, executeNow) {
        if (focused$1) {
          return;
        }
        processModule(name, options, executeNow, {
          skip: true
        });
      };
      module$1.todo = function(name, options, executeNow) {
        if (focused$1) {
          return;
        }
        processModule(name, options, executeNow, {
          todo: true
        });
      };
      var LISTENERS = Object.create(null);
      var SUPPORTED_EVENTS = ["runStart", "suiteStart", "testStart", "assertion", "testEnd", "suiteEnd", "runEnd"];
      function emit(eventName, data) {
        if (objectType2(eventName) !== "string") {
          throw new TypeError("eventName must be a string when emitting an event");
        }
        var originalCallbacks = LISTENERS[eventName];
        var callbacks = originalCallbacks ? _toConsumableArray(originalCallbacks) : [];
        for (var i = 0; i < callbacks.length; i++) {
          callbacks[i](data);
        }
      }
      function on2(eventName, callback) {
        if (objectType2(eventName) !== "string") {
          throw new TypeError("eventName must be a string when registering a listener");
        } else if (!inArray(eventName, SUPPORTED_EVENTS)) {
          var events = SUPPORTED_EVENTS.join(", ");
          throw new Error('"'.concat(eventName, '" is not a valid event; must be one of: ').concat(events, "."));
        } else if (objectType2(callback) !== "function") {
          throw new TypeError("callback must be a function when registering a listener");
        }
        if (!LISTENERS[eventName]) {
          LISTENERS[eventName] = [];
        }
        if (!inArray(callback, LISTENERS[eventName])) {
          LISTENERS[eventName].push(callback);
        }
      }
      var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
      function createCommonjsModule(fn) {
        var module3 = {exports: {}};
        return fn(module3, module3.exports), module3.exports;
      }
      function commonjsRequire(path) {
        throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
      }
      var promisePolyfill = createCommonjsModule(function(module3) {
        (function() {
          var globalNS = function() {
            if (typeof globalThis !== "undefined") {
              return globalThis;
            }
            if (typeof self !== "undefined") {
              return self;
            }
            if (typeof window !== "undefined") {
              return window;
            }
            if (typeof commonjsGlobal !== "undefined") {
              return commonjsGlobal;
            }
            throw new Error("unable to locate global object");
          }();
          if (typeof globalNS["Promise"] === "function") {
            module3.exports = globalNS["Promise"];
            return;
          }
          function finallyConstructor(callback) {
            var constructor = this.constructor;
            return this.then(function(value) {
              return constructor.resolve(callback()).then(function() {
                return value;
              });
            }, function(reason) {
              return constructor.resolve(callback()).then(function() {
                return constructor.reject(reason);
              });
            });
          }
          function allSettled(arr) {
            var P = this;
            return new P(function(resolve2, reject2) {
              if (!(arr && typeof arr.length !== "undefined")) {
                return reject2(new TypeError(_typeof(arr) + " " + arr + " is not iterable(cannot read property Symbol(Symbol.iterator))"));
              }
              var args = Array.prototype.slice.call(arr);
              if (args.length === 0)
                return resolve2([]);
              var remaining = args.length;
              function res(i2, val) {
                if (val && (_typeof(val) === "object" || typeof val === "function")) {
                  var then = val.then;
                  if (typeof then === "function") {
                    then.call(val, function(val2) {
                      res(i2, val2);
                    }, function(e) {
                      args[i2] = {
                        status: "rejected",
                        reason: e
                      };
                      if (--remaining === 0) {
                        resolve2(args);
                      }
                    });
                    return;
                  }
                }
                args[i2] = {
                  status: "fulfilled",
                  value: val
                };
                if (--remaining === 0) {
                  resolve2(args);
                }
              }
              for (var i = 0; i < args.length; i++) {
                res(i, args[i]);
              }
            });
          }
          var setTimeoutFunc = setTimeout;
          function isArray(x) {
            return Boolean(x && typeof x.length !== "undefined");
          }
          function noop() {
          }
          function bind(fn, thisArg) {
            return function() {
              fn.apply(thisArg, arguments);
            };
          }
          function Promise2(fn) {
            if (!(this instanceof Promise2))
              throw new TypeError("Promises must be constructed via new");
            if (typeof fn !== "function")
              throw new TypeError("not a function");
            this._state = 0;
            this._handled = false;
            this._value = void 0;
            this._deferreds = [];
            doResolve(fn, this);
          }
          function handle(self2, deferred) {
            while (self2._state === 3) {
              self2 = self2._value;
            }
            if (self2._state === 0) {
              self2._deferreds.push(deferred);
              return;
            }
            self2._handled = true;
            Promise2._immediateFn(function() {
              var cb = self2._state === 1 ? deferred.onFulfilled : deferred.onRejected;
              if (cb === null) {
                (self2._state === 1 ? resolve : reject)(deferred.promise, self2._value);
                return;
              }
              var ret;
              try {
                ret = cb(self2._value);
              } catch (e) {
                reject(deferred.promise, e);
                return;
              }
              resolve(deferred.promise, ret);
            });
          }
          function resolve(self2, newValue) {
            try {
              if (newValue === self2)
                throw new TypeError("A promise cannot be resolved with itself.");
              if (newValue && (_typeof(newValue) === "object" || typeof newValue === "function")) {
                var then = newValue.then;
                if (newValue instanceof Promise2) {
                  self2._state = 3;
                  self2._value = newValue;
                  finale(self2);
                  return;
                } else if (typeof then === "function") {
                  doResolve(bind(then, newValue), self2);
                  return;
                }
              }
              self2._state = 1;
              self2._value = newValue;
              finale(self2);
            } catch (e) {
              reject(self2, e);
            }
          }
          function reject(self2, newValue) {
            self2._state = 2;
            self2._value = newValue;
            finale(self2);
          }
          function finale(self2) {
            if (self2._state === 2 && self2._deferreds.length === 0) {
              Promise2._immediateFn(function() {
                if (!self2._handled) {
                  Promise2._unhandledRejectionFn(self2._value);
                }
              });
            }
            for (var i = 0, len = self2._deferreds.length; i < len; i++) {
              handle(self2, self2._deferreds[i]);
            }
            self2._deferreds = null;
          }
          function Handler(onFulfilled, onRejected, promise) {
            this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
            this.onRejected = typeof onRejected === "function" ? onRejected : null;
            this.promise = promise;
          }
          function doResolve(fn, self2) {
            var done3 = false;
            try {
              fn(function(value) {
                if (done3)
                  return;
                done3 = true;
                resolve(self2, value);
              }, function(reason) {
                if (done3)
                  return;
                done3 = true;
                reject(self2, reason);
              });
            } catch (ex) {
              if (done3)
                return;
              done3 = true;
              reject(self2, ex);
            }
          }
          Promise2.prototype["catch"] = function(onRejected) {
            return this.then(null, onRejected);
          };
          Promise2.prototype.then = function(onFulfilled, onRejected) {
            var prom = new this.constructor(noop);
            handle(this, new Handler(onFulfilled, onRejected, prom));
            return prom;
          };
          Promise2.prototype["finally"] = finallyConstructor;
          Promise2.all = function(arr) {
            return new Promise2(function(resolve2, reject2) {
              if (!isArray(arr)) {
                return reject2(new TypeError("Promise.all accepts an array"));
              }
              var args = Array.prototype.slice.call(arr);
              if (args.length === 0)
                return resolve2([]);
              var remaining = args.length;
              function res(i2, val) {
                try {
                  if (val && (_typeof(val) === "object" || typeof val === "function")) {
                    var then = val.then;
                    if (typeof then === "function") {
                      then.call(val, function(val2) {
                        res(i2, val2);
                      }, reject2);
                      return;
                    }
                  }
                  args[i2] = val;
                  if (--remaining === 0) {
                    resolve2(args);
                  }
                } catch (ex) {
                  reject2(ex);
                }
              }
              for (var i = 0; i < args.length; i++) {
                res(i, args[i]);
              }
            });
          };
          Promise2.allSettled = allSettled;
          Promise2.resolve = function(value) {
            if (value && _typeof(value) === "object" && value.constructor === Promise2) {
              return value;
            }
            return new Promise2(function(resolve2) {
              resolve2(value);
            });
          };
          Promise2.reject = function(value) {
            return new Promise2(function(resolve2, reject2) {
              reject2(value);
            });
          };
          Promise2.race = function(arr) {
            return new Promise2(function(resolve2, reject2) {
              if (!isArray(arr)) {
                return reject2(new TypeError("Promise.race accepts an array"));
              }
              for (var i = 0, len = arr.length; i < len; i++) {
                Promise2.resolve(arr[i]).then(resolve2, reject2);
              }
            });
          };
          Promise2._immediateFn = typeof setImmediate === "function" && function(fn) {
            setImmediate(fn);
          } || function(fn) {
            setTimeoutFunc(fn, 0);
          };
          Promise2._unhandledRejectionFn = function _unhandledRejectionFn(err) {
            if (typeof console !== "undefined" && console) {
              console.warn("Possible Unhandled Promise Rejection:", err);
            }
          };
          module3.exports = Promise2;
        })();
      });
      function registerLoggingCallbacks(obj) {
        var callbackNames = ["begin", "done", "log", "testStart", "testDone", "moduleStart", "moduleDone"];
        function registerLoggingCallback(key2) {
          var loggingCallback = function loggingCallback2(callback) {
            if (objectType2(callback) !== "function") {
              throw new Error("QUnit logging methods require a callback function as their first parameters.");
            }
            config2.callbacks[key2].push(callback);
          };
          return loggingCallback;
        }
        for (var i = 0, l = callbackNames.length; i < l; i++) {
          var key = callbackNames[i];
          if (objectType2(config2.callbacks[key]) === "undefined") {
            config2.callbacks[key] = [];
          }
          obj[key] = registerLoggingCallback(key);
        }
      }
      function runLoggingCallbacks(key, args) {
        var callbacks = config2.callbacks[key];
        if (key === "log") {
          callbacks.map(function(callback) {
            return callback(args);
          });
          return;
        }
        return callbacks.reduce(function(promiseChain, callback) {
          return promiseChain.then(function() {
            return promisePolyfill.resolve(callback(args));
          });
        }, promisePolyfill.resolve([]));
      }
      var fileName = (sourceFromStacktrace(0) || "").replace(/(:\d+)+\)?/, "").replace(/.+\//, "");
      function extractStacktrace(e, offset) {
        offset = offset === void 0 ? 4 : offset;
        if (e && e.stack) {
          var stack2 = e.stack.split("\n");
          if (/^error$/i.test(stack2[0])) {
            stack2.shift();
          }
          if (fileName) {
            var include = [];
            for (var i = offset; i < stack2.length; i++) {
              if (stack2[i].indexOf(fileName) !== -1) {
                break;
              }
              include.push(stack2[i]);
            }
            if (include.length) {
              return include.join("\n");
            }
          }
          return stack2[offset];
        }
      }
      function sourceFromStacktrace(offset) {
        var error = new Error();
        if (!error.stack) {
          try {
            throw error;
          } catch (err) {
            error = err;
          }
        }
        return extractStacktrace(error, offset);
      }
      var priorityCount = 0;
      var unitSampler;
      var taskQueue = [];
      function advance() {
        advanceTaskQueue();
        if (!taskQueue.length && !config2.blocking && !config2.current) {
          advanceTestQueue();
        }
      }
      function advanceTaskQueue() {
        var start2 = now();
        config2.depth = (config2.depth || 0) + 1;
        processTaskQueue(start2);
        config2.depth--;
      }
      function processTaskQueue(start2) {
        if (taskQueue.length && !config2.blocking) {
          var elapsedTime = now() - start2;
          if (!setTimeout$1 || config2.updateRate <= 0 || elapsedTime < config2.updateRate) {
            var task = taskQueue.shift();
            promisePolyfill.resolve(task()).then(function() {
              if (!taskQueue.length) {
                advance();
              } else {
                processTaskQueue(start2);
              }
            });
          } else {
            setTimeout$1(advance);
          }
        }
      }
      function advanceTestQueue() {
        if (!config2.blocking && !config2.queue.length && config2.depth === 0) {
          done2();
          return;
        }
        var testTasks = config2.queue.shift();
        addToTaskQueue(testTasks());
        if (priorityCount > 0) {
          priorityCount--;
        }
        advance();
      }
      function addToTaskQueue(tasksArray) {
        taskQueue.push.apply(taskQueue, _toConsumableArray(tasksArray));
      }
      function taskQueueLength() {
        return taskQueue.length;
      }
      function addToTestQueue(testTasksFunc, prioritize, seed) {
        if (prioritize) {
          config2.queue.splice(priorityCount++, 0, testTasksFunc);
        } else if (seed) {
          if (!unitSampler) {
            unitSampler = unitSamplerGenerator(seed);
          }
          var index = Math.floor(unitSampler() * (config2.queue.length - priorityCount + 1));
          config2.queue.splice(priorityCount + index, 0, testTasksFunc);
        } else {
          config2.queue.push(testTasksFunc);
        }
      }
      function unitSamplerGenerator(seed) {
        var sample = parseInt(generateHash(seed), 16) || -1;
        return function() {
          sample ^= sample << 13;
          sample ^= sample >>> 17;
          sample ^= sample << 5;
          if (sample < 0) {
            sample += 4294967296;
          }
          return sample / 4294967296;
        };
      }
      function done2() {
        var storage = config2.storage;
        ProcessingQueue.finished = true;
        var runtime = now() - config2.started;
        var passed = config2.stats.all - config2.stats.bad;
        if (config2.stats.testCount === 0) {
          if (config2.filter && config2.filter.length) {
            throw new Error('No tests matched the filter "'.concat(config2.filter, '".'));
          }
          if (config2.module && config2.module.length) {
            throw new Error('No tests matched the module "'.concat(config2.module, '".'));
          }
          if (config2.moduleId && config2.moduleId.length) {
            throw new Error('No tests matched the moduleId "'.concat(config2.moduleId, '".'));
          }
          if (config2.testId && config2.testId.length) {
            throw new Error('No tests matched the testId "'.concat(config2.testId, '".'));
          }
          throw new Error("No tests were run.");
        }
        emit("runEnd", globalSuite.end(true));
        runLoggingCallbacks("done", {
          passed,
          failed: config2.stats.bad,
          total: config2.stats.all,
          runtime
        }).then(function() {
          if (storage && config2.stats.bad === 0) {
            for (var i = storage.length - 1; i >= 0; i--) {
              var key = storage.key(i);
              if (key.indexOf("qunit-test-") === 0) {
                storage.removeItem(key);
              }
            }
          }
        });
      }
      var ProcessingQueue = {
        finished: false,
        add: addToTestQueue,
        advance,
        taskCount: taskQueueLength
      };
      var TestReport = /* @__PURE__ */ function() {
        function TestReport2(name, suite, options) {
          _classCallCheck(this, TestReport2);
          this.name = name;
          this.suiteName = suite.name;
          this.fullName = suite.fullName.concat(name);
          this.runtime = 0;
          this.assertions = [];
          this.skipped = !!options.skip;
          this.todo = !!options.todo;
          this.valid = options.valid;
          this._startTime = 0;
          this._endTime = 0;
          suite.pushTest(this);
        }
        _createClass(TestReport2, [{
          key: "start",
          value: function start2(recordTime) {
            if (recordTime) {
              this._startTime = performance.now();
              performance.mark("qunit_test_start");
            }
            return {
              name: this.name,
              suiteName: this.suiteName,
              fullName: this.fullName.slice()
            };
          }
        }, {
          key: "end",
          value: function end(recordTime) {
            if (recordTime) {
              this._endTime = performance.now();
              if (performance) {
                performance.mark("qunit_test_end");
                var testName = this.fullName.join(" \u2013 ");
                performance.measure("QUnit Test: ".concat(testName), "qunit_test_start", "qunit_test_end");
              }
            }
            return extend2(this.start(), {
              runtime: this.getRuntime(),
              status: this.getStatus(),
              errors: this.getFailedAssertions(),
              assertions: this.getAssertions()
            });
          }
        }, {
          key: "pushAssertion",
          value: function pushAssertion(assertion) {
            this.assertions.push(assertion);
          }
        }, {
          key: "getRuntime",
          value: function getRuntime() {
            return this._endTime - this._startTime;
          }
        }, {
          key: "getStatus",
          value: function getStatus() {
            if (this.skipped) {
              return "skipped";
            }
            var testPassed = this.getFailedAssertions().length > 0 ? this.todo : !this.todo;
            if (!testPassed) {
              return "failed";
            } else if (this.todo) {
              return "todo";
            } else {
              return "passed";
            }
          }
        }, {
          key: "getFailedAssertions",
          value: function getFailedAssertions() {
            return this.assertions.filter(function(assertion) {
              return !assertion.passed;
            });
          }
        }, {
          key: "getAssertions",
          value: function getAssertions() {
            return this.assertions.slice();
          }
        }, {
          key: "slimAssertions",
          value: function slimAssertions() {
            this.assertions = this.assertions.map(function(assertion) {
              delete assertion.actual;
              delete assertion.expected;
              return assertion;
            });
          }
        }]);
        return TestReport2;
      }();
      function Test(settings) {
        this.expected = null;
        this.assertions = [];
        this.semaphore = 0;
        this.module = config2.currentModule;
        this.steps = [];
        this.timeout = void 0;
        extend2(this, settings);
        if (this.module.skip) {
          this.skip = true;
          this.todo = false;
        } else if (this.module.todo && !this.skip) {
          this.todo = true;
        }
        if (!this.skip && typeof this.callback !== "function") {
          var method = this.todo ? "QUnit.todo" : "QUnit.test";
          throw new TypeError("You must provide a callback to ".concat(method, '("').concat(this.testName, '")'));
        }
        ++Test.count;
        this.errorForStack = new Error();
        this.testReport = new TestReport(this.testName, this.module.suiteReport, {
          todo: this.todo,
          skip: this.skip,
          valid: this.valid()
        });
        for (var i = 0, l = this.module.tests; i < l.length; i++) {
          if (this.module.tests[i].name === this.testName) {
            this.testName += " ";
          }
        }
        this.testId = generateHash(this.module.name, this.testName);
        this.module.tests.push({
          name: this.testName,
          testId: this.testId,
          skip: !!this.skip
        });
        if (this.skip) {
          this.callback = function() {
          };
          this.async = false;
          this.expected = 0;
        } else {
          this.assert = new Assert(this);
        }
      }
      Test.count = 0;
      function getNotStartedModules(startModule) {
        var module3 = startModule;
        var modules = [];
        while (module3 && module3.testsRun === 0) {
          modules.push(module3);
          module3 = module3.parentModule;
        }
        return modules.reverse();
      }
      Test.prototype = {
        get stack() {
          return extractStacktrace(this.errorForStack, 2);
        },
        before: function before() {
          var _this = this;
          var module3 = this.module;
          var notStartedModules = getNotStartedModules(module3);
          var callbackPromises = notStartedModules.reduce(function(promiseChain, startModule) {
            return promiseChain.then(function() {
              startModule.stats = {
                all: 0,
                bad: 0,
                started: now()
              };
              emit("suiteStart", startModule.suiteReport.start(true));
              return runLoggingCallbacks("moduleStart", {
                name: startModule.name,
                tests: startModule.tests
              });
            });
          }, promisePolyfill.resolve([]));
          return callbackPromises.then(function() {
            config2.current = _this;
            _this.testEnvironment = extend2({}, module3.testEnvironment);
            _this.started = now();
            emit("testStart", _this.testReport.start(true));
            return runLoggingCallbacks("testStart", {
              name: _this.testName,
              module: module3.name,
              testId: _this.testId,
              previousFailure: _this.previousFailure
            }).then(function() {
              if (!config2.pollution) {
                saveGlobal();
              }
            });
          });
        },
        run: function run() {
          config2.current = this;
          this.callbackStarted = now();
          if (config2.notrycatch) {
            runTest(this);
            return;
          }
          try {
            runTest(this);
          } catch (e) {
            this.pushFailure("Died on test #" + (this.assertions.length + 1) + " " + this.stack + ": " + (e.message || e), extractStacktrace(e, 0));
            saveGlobal();
            if (config2.blocking) {
              internalRecover(this);
            }
          }
          function runTest(test3) {
            var promise = test3.callback.call(test3.testEnvironment, test3.assert);
            test3.resolvePromise(promise);
            if (test3.timeout === 0 && test3.semaphore !== 0) {
              pushFailure2("Test did not finish synchronously even though assert.timeout( 0 ) was used.", sourceFromStacktrace(2));
            }
          }
        },
        after: function after() {
          checkPollution();
        },
        queueHook: function queueHook(hook, hookName, hookOwner) {
          var _this2 = this;
          var callHook = function callHook2() {
            var promise = hook.call(_this2.testEnvironment, _this2.assert);
            _this2.resolvePromise(promise, hookName);
          };
          var runHook = function runHook2() {
            if (hookName === "before") {
              if (hookOwner.testsRun !== 0) {
                return;
              }
              _this2.preserveEnvironment = true;
            }
            if (hookName === "after" && !lastTestWithinModuleExecuted(hookOwner) && (config2.queue.length > 0 || ProcessingQueue.taskCount() > 2)) {
              return;
            }
            config2.current = _this2;
            if (config2.notrycatch) {
              callHook();
              return;
            }
            try {
              callHook();
            } catch (error) {
              _this2.pushFailure(hookName + " failed on " + _this2.testName + ": " + (error.message || error), extractStacktrace(error, 0));
            }
          };
          return runHook;
        },
        hooks: function hooks(handler) {
          var hooks2 = [];
          function processHooks(test3, module3) {
            if (module3.parentModule) {
              processHooks(test3, module3.parentModule);
            }
            if (module3.hooks[handler].length) {
              for (var i = 0; i < module3.hooks[handler].length; i++) {
                hooks2.push(test3.queueHook(module3.hooks[handler][i], handler, module3));
              }
            }
          }
          if (!this.skip) {
            processHooks(this, this.module);
          }
          return hooks2;
        },
        finish: function finish() {
          config2.current = this;
          this.callback = void 0;
          if (this.steps.length) {
            var stepsList = this.steps.join(", ");
            this.pushFailure("Expected assert.verifySteps() to be called before end of test " + "after using assert.step(). Unverified steps: ".concat(stepsList), this.stack);
          }
          if (config2.requireExpects && this.expected === null) {
            this.pushFailure("Expected number of assertions to be defined, but expect() was not called.", this.stack);
          } else if (this.expected !== null && this.expected !== this.assertions.length) {
            this.pushFailure("Expected " + this.expected + " assertions, but " + this.assertions.length + " were run", this.stack);
          } else if (this.expected === null && !this.assertions.length) {
            this.pushFailure("Expected at least one assertion, but none were run - call expect(0) to accept zero assertions.", this.stack);
          }
          var module3 = this.module;
          var moduleName = module3.name;
          var testName = this.testName;
          var skipped = !!this.skip;
          var todo2 = !!this.todo;
          var bad = 0;
          var storage = config2.storage;
          this.runtime = now() - this.started;
          config2.stats.all += this.assertions.length;
          config2.stats.testCount += 1;
          module3.stats.all += this.assertions.length;
          for (var i = 0; i < this.assertions.length; i++) {
            if (!this.assertions[i].result) {
              bad++;
              config2.stats.bad++;
              module3.stats.bad++;
            }
          }
          if (skipped) {
            incrementTestsIgnored(module3);
          } else {
            incrementTestsRun(module3);
          }
          if (storage) {
            if (bad) {
              storage.setItem("qunit-test-" + moduleName + "-" + testName, bad);
            } else {
              storage.removeItem("qunit-test-" + moduleName + "-" + testName);
            }
          }
          emit("testEnd", this.testReport.end(true));
          this.testReport.slimAssertions();
          var test3 = this;
          return runLoggingCallbacks("testDone", {
            name: testName,
            module: moduleName,
            skipped,
            todo: todo2,
            failed: bad,
            passed: this.assertions.length - bad,
            total: this.assertions.length,
            runtime: skipped ? 0 : this.runtime,
            assertions: this.assertions,
            testId: this.testId,
            get source() {
              return test3.stack;
            }
          }).then(function() {
            if (allTestsExecuted(module3)) {
              var completedModules = [module3];
              var parent = module3.parentModule;
              while (parent && allTestsExecuted(parent)) {
                completedModules.push(parent);
                parent = parent.parentModule;
              }
              return completedModules.reduce(function(promiseChain, completedModule) {
                return promiseChain.then(function() {
                  return logSuiteEnd(completedModule);
                });
              }, promisePolyfill.resolve([]));
            }
          }).then(function() {
            config2.current = void 0;
          });
          function logSuiteEnd(module4) {
            module4.hooks = {};
            emit("suiteEnd", module4.suiteReport.end(true));
            return runLoggingCallbacks("moduleDone", {
              name: module4.name,
              tests: module4.tests,
              failed: module4.stats.bad,
              passed: module4.stats.all - module4.stats.bad,
              total: module4.stats.all,
              runtime: now() - module4.stats.started
            });
          }
        },
        preserveTestEnvironment: function preserveTestEnvironment() {
          if (this.preserveEnvironment) {
            this.module.testEnvironment = this.testEnvironment;
            this.testEnvironment = extend2({}, this.module.testEnvironment);
          }
        },
        queue: function queue() {
          var test3 = this;
          if (!this.valid()) {
            incrementTestsIgnored(this.module);
            return;
          }
          function runTest() {
            return [function() {
              return test3.before();
            }].concat(_toConsumableArray(test3.hooks("before")), [function() {
              test3.preserveTestEnvironment();
            }], _toConsumableArray(test3.hooks("beforeEach")), [function() {
              test3.run();
            }], _toConsumableArray(test3.hooks("afterEach").reverse()), _toConsumableArray(test3.hooks("after").reverse()), [function() {
              test3.after();
            }, function() {
              return test3.finish();
            }]);
          }
          var previousFailCount = config2.storage && +config2.storage.getItem("qunit-test-" + this.module.name + "-" + this.testName);
          var prioritize = config2.reorder && !!previousFailCount;
          this.previousFailure = !!previousFailCount;
          ProcessingQueue.add(runTest, prioritize, config2.seed);
          if (ProcessingQueue.finished) {
            ProcessingQueue.advance();
          }
        },
        pushResult: function pushResult(resultInfo) {
          if (this !== config2.current) {
            var message = resultInfo && resultInfo.message || "";
            var testName = this && this.testName || "";
            var error = "Assertion occurred after test finished.\n> Test: " + testName + "\n> Message: " + message + "\n";
            throw new Error(error);
          }
          var details = {
            module: this.module.name,
            name: this.testName,
            result: resultInfo.result,
            message: resultInfo.message,
            actual: resultInfo.actual,
            testId: this.testId,
            negative: resultInfo.negative || false,
            runtime: now() - this.started,
            todo: !!this.todo
          };
          if (hasOwn.call(resultInfo, "expected")) {
            details.expected = resultInfo.expected;
          }
          if (!resultInfo.result) {
            var source = resultInfo.source || sourceFromStacktrace();
            if (source) {
              details.source = source;
            }
          }
          this.logAssertion(details);
          this.assertions.push({
            result: !!resultInfo.result,
            message: resultInfo.message
          });
        },
        pushFailure: function pushFailure3(message, source, actual) {
          if (!(this instanceof Test)) {
            throw new Error("pushFailure() assertion outside test context, was " + sourceFromStacktrace(2));
          }
          this.pushResult({
            result: false,
            message: message || "error",
            actual: actual || null,
            source
          });
        },
        logAssertion: function logAssertion(details) {
          runLoggingCallbacks("log", details);
          var assertion = {
            passed: details.result,
            actual: details.actual,
            expected: details.expected,
            message: details.message,
            stack: details.source,
            todo: details.todo
          };
          this.testReport.pushAssertion(assertion);
          emit("assertion", assertion);
        },
        resolvePromise: function resolvePromise(promise, phase) {
          if (promise != null) {
            var _test = this;
            var then = promise.then;
            if (objectType2(then) === "function") {
              var resume = internalStop(_test);
              if (config2.notrycatch) {
                then.call(promise, function() {
                  resume();
                });
              } else {
                then.call(promise, function() {
                  resume();
                }, function(error) {
                  var message = "Promise rejected " + (!phase ? "during" : phase.replace(/Each$/, "")) + ' "' + _test.testName + '": ' + (error && error.message || error);
                  _test.pushFailure(message, extractStacktrace(error, 0));
                  saveGlobal();
                  internalRecover(_test);
                });
              }
            }
          }
        },
        valid: function valid() {
          var filter = config2.filter;
          var regexFilter = /^(!?)\/([\w\W]*)\/(i?$)/.exec(filter);
          var module3 = config2.module && config2.module.toLowerCase();
          var fullName = this.module.name + ": " + this.testName;
          function moduleChainNameMatch(testModule) {
            var testModuleName = testModule.name ? testModule.name.toLowerCase() : null;
            if (testModuleName === module3) {
              return true;
            } else if (testModule.parentModule) {
              return moduleChainNameMatch(testModule.parentModule);
            } else {
              return false;
            }
          }
          function moduleChainIdMatch(testModule) {
            return inArray(testModule.moduleId, config2.moduleId) || testModule.parentModule && moduleChainIdMatch(testModule.parentModule);
          }
          if (this.callback && this.callback.validTest) {
            return true;
          }
          if (config2.moduleId && config2.moduleId.length > 0 && !moduleChainIdMatch(this.module)) {
            return false;
          }
          if (config2.testId && config2.testId.length > 0 && !inArray(this.testId, config2.testId)) {
            return false;
          }
          if (module3 && !moduleChainNameMatch(this.module)) {
            return false;
          }
          if (!filter) {
            return true;
          }
          return regexFilter ? this.regexFilter(!!regexFilter[1], regexFilter[2], regexFilter[3], fullName) : this.stringFilter(filter, fullName);
        },
        regexFilter: function regexFilter(exclude, pattern, flags, fullName) {
          var regex = new RegExp(pattern, flags);
          var match = regex.test(fullName);
          return match !== exclude;
        },
        stringFilter: function stringFilter(filter, fullName) {
          filter = filter.toLowerCase();
          fullName = fullName.toLowerCase();
          var include = filter.charAt(0) !== "!";
          if (!include) {
            filter = filter.slice(1);
          }
          if (fullName.indexOf(filter) !== -1) {
            return include;
          }
          return !include;
        }
      };
      function pushFailure2() {
        if (!config2.current) {
          throw new Error("pushFailure() assertion outside test context, in " + sourceFromStacktrace(2));
        }
        var currentTest = config2.current;
        return currentTest.pushFailure.apply(currentTest, arguments);
      }
      function saveGlobal() {
        config2.pollution = [];
        if (config2.noglobals) {
          for (var key in globalThis$1) {
            if (hasOwn.call(globalThis$1, key)) {
              if (/^qunit-test-output/.test(key)) {
                continue;
              }
              config2.pollution.push(key);
            }
          }
        }
      }
      function checkPollution() {
        var old = config2.pollution;
        saveGlobal();
        var newGlobals = diff2(config2.pollution, old);
        if (newGlobals.length > 0) {
          pushFailure2("Introduced global variable(s): " + newGlobals.join(", "));
        }
        var deletedGlobals = diff2(old, config2.pollution);
        if (deletedGlobals.length > 0) {
          pushFailure2("Deleted global variable(s): " + deletedGlobals.join(", "));
        }
      }
      var focused = false;
      function test2(testName, callback) {
        if (focused || config2.currentModule.ignored) {
          return;
        }
        var newTest = new Test({
          testName,
          callback
        });
        newTest.queue();
      }
      extend2(test2, {
        todo: function todo2(testName, callback) {
          if (focused || config2.currentModule.ignored) {
            return;
          }
          var newTest = new Test({
            testName,
            callback,
            todo: true
          });
          newTest.queue();
        },
        skip: function skip2(testName) {
          if (focused || config2.currentModule.ignored) {
            return;
          }
          var test3 = new Test({
            testName,
            skip: true
          });
          test3.queue();
        },
        only: function only2(testName, callback) {
          if (config2.currentModule.ignored) {
            return;
          }
          if (!focused) {
            config2.queue.length = 0;
            focused = true;
          }
          var newTest = new Test({
            testName,
            callback
          });
          newTest.queue();
        }
      });
      function resetTestTimeout(timeoutDuration) {
        clearTimeout(config2.timeout);
        config2.timeout = setTimeout$1(config2.timeoutHandler(timeoutDuration), timeoutDuration);
      }
      function internalStop(test3) {
        var released = false;
        test3.semaphore += 1;
        config2.blocking = true;
        if (setTimeout$1) {
          var timeoutDuration;
          if (typeof test3.timeout === "number") {
            timeoutDuration = test3.timeout;
          } else if (typeof config2.testTimeout === "number") {
            timeoutDuration = config2.testTimeout;
          }
          if (typeof timeoutDuration === "number" && timeoutDuration > 0) {
            config2.timeoutHandler = function(timeout) {
              return function() {
                config2.timeout = null;
                pushFailure2("Test took longer than ".concat(timeout, "ms; test timed out."), sourceFromStacktrace(2));
                released = true;
                internalRecover(test3);
              };
            };
            clearTimeout(config2.timeout);
            config2.timeout = setTimeout$1(config2.timeoutHandler(timeoutDuration), timeoutDuration);
          }
        }
        return function resume() {
          if (released) {
            return;
          }
          released = true;
          test3.semaphore -= 1;
          internalStart(test3);
        };
      }
      function internalRecover(test3) {
        test3.semaphore = 0;
        internalStart(test3);
      }
      function internalStart(test3) {
        if (isNaN(test3.semaphore)) {
          test3.semaphore = 0;
          pushFailure2("Invalid value on test.semaphore", sourceFromStacktrace(2));
          return;
        }
        if (test3.semaphore > 0) {
          return;
        }
        if (test3.semaphore < 0) {
          test3.semaphore = 0;
          pushFailure2("Tried to restart test while already started (test's semaphore was 0 already)", sourceFromStacktrace(2));
          return;
        }
        if (setTimeout$1) {
          clearTimeout(config2.timeout);
          config2.timeout = setTimeout$1(function() {
            if (test3.semaphore > 0) {
              return;
            }
            clearTimeout(config2.timeout);
            config2.timeout = null;
            begin2();
          });
        } else {
          begin2();
        }
      }
      function collectTests(module3) {
        var tests = [].concat(module3.tests);
        var modules = _toConsumableArray(module3.childModules);
        while (modules.length) {
          var nextModule = modules.shift();
          tests.push.apply(tests, nextModule.tests);
          modules.push.apply(modules, _toConsumableArray(nextModule.childModules));
        }
        return tests;
      }
      function allTestsExecuted(module3) {
        return module3.testsRun + module3.testsIgnored === collectTests(module3).length;
      }
      function lastTestWithinModuleExecuted(module3) {
        return module3.testsRun === collectTests(module3).filter(function(test3) {
          return !test3.skip;
        }).length - 1;
      }
      function incrementTestsRun(module3) {
        module3.testsRun++;
        while (module3 = module3.parentModule) {
          module3.testsRun++;
        }
      }
      function incrementTestsIgnored(module3) {
        module3.testsIgnored++;
        while (module3 = module3.parentModule) {
          module3.testsIgnored++;
        }
      }
      var Assert = /* @__PURE__ */ function() {
        function Assert2(testContext) {
          _classCallCheck(this, Assert2);
          this.test = testContext;
        }
        _createClass(Assert2, [{
          key: "timeout",
          value: function timeout(duration) {
            if (typeof duration !== "number") {
              throw new Error("You must pass a number as the duration to assert.timeout");
            }
            this.test.timeout = duration;
            if (config2.timeout) {
              clearTimeout(config2.timeout);
              config2.timeout = null;
              if (config2.timeoutHandler && this.test.timeout > 0) {
                resetTestTimeout(this.test.timeout);
              }
            }
          }
        }, {
          key: "step",
          value: function step(message) {
            var assertionMessage = message;
            var result = !!message;
            this.test.steps.push(message);
            if (objectType2(message) === "undefined" || message === "") {
              assertionMessage = "You must provide a message to assert.step";
            } else if (objectType2(message) !== "string") {
              assertionMessage = "You must provide a string value to assert.step";
              result = false;
            }
            this.pushResult({
              result,
              message: assertionMessage
            });
          }
        }, {
          key: "verifySteps",
          value: function verifySteps(steps, message) {
            var actualStepsClone = this.test.steps.slice();
            this.deepEqual(actualStepsClone, steps, message);
            this.test.steps.length = 0;
          }
        }, {
          key: "expect",
          value: function expect(asserts) {
            if (arguments.length === 1) {
              this.test.expected = asserts;
            } else {
              return this.test.expected;
            }
          }
        }, {
          key: "async",
          value: function async(count) {
            var test3 = this.test;
            var popped = false, acceptCallCount = count;
            if (typeof acceptCallCount === "undefined") {
              acceptCallCount = 1;
            }
            var resume = internalStop(test3);
            return function done3() {
              if (config2.current !== test3) {
                throw Error("assert.async callback called after test finished.");
              }
              if (popped) {
                test3.pushFailure("Too many calls to the `assert.async` callback", sourceFromStacktrace(2));
                return;
              }
              acceptCallCount -= 1;
              if (acceptCallCount > 0) {
                return;
              }
              popped = true;
              resume();
            };
          }
        }, {
          key: "push",
          value: function push(result, actual, expected, message, negative) {
            Logger.warn("assert.push is deprecated and will be removed in QUnit 3.0. Please use assert.pushResult instead (https://api.qunitjs.com/assert/pushResult).");
            var currentAssert = this instanceof Assert2 ? this : config2.current.assert;
            return currentAssert.pushResult({
              result,
              actual,
              expected,
              message,
              negative
            });
          }
        }, {
          key: "pushResult",
          value: function pushResult(resultInfo) {
            var assert2 = this;
            var currentTest = assert2 instanceof Assert2 && assert2.test || config2.current;
            if (!currentTest) {
              throw new Error("assertion outside test context, in " + sourceFromStacktrace(2));
            }
            if (!(assert2 instanceof Assert2)) {
              assert2 = currentTest.assert;
            }
            return assert2.test.pushResult(resultInfo);
          }
        }, {
          key: "ok",
          value: function ok(result, message) {
            if (!message) {
              message = result ? "okay" : "failed, expected argument to be truthy, was: ".concat(dump2.parse(result));
            }
            this.pushResult({
              result: !!result,
              actual: result,
              expected: true,
              message
            });
          }
        }, {
          key: "notOk",
          value: function notOk(result, message) {
            if (!message) {
              message = !result ? "okay" : "failed, expected argument to be falsy, was: ".concat(dump2.parse(result));
            }
            this.pushResult({
              result: !result,
              actual: result,
              expected: false,
              message
            });
          }
        }, {
          key: "true",
          value: function _true(result, message) {
            this.pushResult({
              result: result === true,
              actual: result,
              expected: true,
              message
            });
          }
        }, {
          key: "false",
          value: function _false(result, message) {
            this.pushResult({
              result: result === false,
              actual: result,
              expected: false,
              message
            });
          }
        }, {
          key: "equal",
          value: function equal(actual, expected, message) {
            var result = expected == actual;
            this.pushResult({
              result,
              actual,
              expected,
              message
            });
          }
        }, {
          key: "notEqual",
          value: function notEqual(actual, expected, message) {
            var result = expected != actual;
            this.pushResult({
              result,
              actual,
              expected,
              message,
              negative: true
            });
          }
        }, {
          key: "propEqual",
          value: function propEqual(actual, expected, message) {
            actual = objectValues(actual);
            expected = objectValues(expected);
            this.pushResult({
              result: equiv2(actual, expected),
              actual,
              expected,
              message
            });
          }
        }, {
          key: "notPropEqual",
          value: function notPropEqual(actual, expected, message) {
            actual = objectValues(actual);
            expected = objectValues(expected);
            this.pushResult({
              result: !equiv2(actual, expected),
              actual,
              expected,
              message,
              negative: true
            });
          }
        }, {
          key: "deepEqual",
          value: function deepEqual(actual, expected, message) {
            this.pushResult({
              result: equiv2(actual, expected),
              actual,
              expected,
              message
            });
          }
        }, {
          key: "notDeepEqual",
          value: function notDeepEqual(actual, expected, message) {
            this.pushResult({
              result: !equiv2(actual, expected),
              actual,
              expected,
              message,
              negative: true
            });
          }
        }, {
          key: "strictEqual",
          value: function strictEqual(actual, expected, message) {
            this.pushResult({
              result: expected === actual,
              actual,
              expected,
              message
            });
          }
        }, {
          key: "notStrictEqual",
          value: function notStrictEqual(actual, expected, message) {
            this.pushResult({
              result: expected !== actual,
              actual,
              expected,
              message,
              negative: true
            });
          }
        }, {
          key: "throws",
          value: function throws(block, expected, message) {
            var actual, result = false;
            var currentTest = this instanceof Assert2 && this.test || config2.current;
            if (objectType2(expected) === "string") {
              if (message == null) {
                message = expected;
                expected = null;
              } else {
                throw new Error("throws/raises does not accept a string value for the expected argument.\nUse a non-string object value (e.g. regExp) instead if it's necessary.");
              }
            }
            currentTest.ignoreGlobalErrors = true;
            try {
              block.call(currentTest.testEnvironment);
            } catch (e) {
              actual = e;
            }
            currentTest.ignoreGlobalErrors = false;
            if (actual) {
              var expectedType = objectType2(expected);
              if (!expected) {
                result = true;
              } else if (expectedType === "regexp") {
                result = expected.test(errorString(actual));
                expected = String(expected);
              } else if (expectedType === "function" && expected.prototype !== void 0 && actual instanceof expected) {
                result = true;
              } else if (expectedType === "object") {
                result = actual instanceof expected.constructor && actual.name === expected.name && actual.message === expected.message;
                expected = errorString(expected);
              } else if (expectedType === "function") {
                try {
                  result = expected.call({}, actual) === true;
                  expected = null;
                } catch (e) {
                  expected = errorString(e);
                }
              }
            }
            currentTest.assert.pushResult({
              result,
              actual: actual && errorString(actual),
              expected,
              message
            });
          }
        }, {
          key: "rejects",
          value: function rejects(promise, expected, message) {
            var result = false;
            var currentTest = this instanceof Assert2 && this.test || config2.current;
            if (objectType2(expected) === "string") {
              if (message === void 0) {
                message = expected;
                expected = void 0;
              } else {
                message = "assert.rejects does not accept a string value for the expected argument.\nUse a non-string object value (e.g. validator function) instead if necessary.";
                currentTest.assert.pushResult({
                  result: false,
                  message
                });
                return;
              }
            }
            var then = promise && promise.then;
            if (objectType2(then) !== "function") {
              var _message = 'The value provided to `assert.rejects` in "' + currentTest.testName + '" was not a promise.';
              currentTest.assert.pushResult({
                result: false,
                message: _message,
                actual: promise
              });
              return;
            }
            var done3 = this.async();
            return then.call(promise, function handleFulfillment() {
              var message2 = 'The promise returned by the `assert.rejects` callback in "' + currentTest.testName + '" did not reject.';
              currentTest.assert.pushResult({
                result: false,
                message: message2,
                actual: promise
              });
              done3();
            }, function handleRejection(actual) {
              var expectedType = objectType2(expected);
              if (expected === void 0) {
                result = true;
              } else if (expectedType === "regexp") {
                result = expected.test(errorString(actual));
                expected = String(expected);
              } else if (expectedType === "function" && actual instanceof expected) {
                result = true;
              } else if (expectedType === "object") {
                result = actual instanceof expected.constructor && actual.name === expected.name && actual.message === expected.message;
                expected = errorString(expected);
              } else {
                if (expectedType === "function") {
                  result = expected.call({}, actual) === true;
                  expected = null;
                } else {
                  result = false;
                  message = 'invalid expected value provided to `assert.rejects` callback in "' + currentTest.testName + '": ' + expectedType + ".";
                }
              }
              currentTest.assert.pushResult({
                result,
                actual: actual && errorString(actual),
                expected,
                message
              });
              done3();
            });
          }
        }]);
        return Assert2;
      }();
      Assert.prototype.raises = Assert.prototype["throws"];
      function errorString(error) {
        var resultErrorString = error.toString();
        if (resultErrorString.slice(0, 7) === "[object") {
          var name = error.name ? String(error.name) : "Error";
          return error.message ? "".concat(name, ": ").concat(error.message) : name;
        } else {
          return resultErrorString;
        }
      }
      function exportQUnit(QUnit3) {
        var exportedModule = false;
        if (window$1 && document) {
          if (window$1.QUnit && window$1.QUnit.version) {
            throw new Error("QUnit has already been defined.");
          }
          window$1.QUnit = QUnit3;
          exportedModule = true;
        }
        if (typeof module2 !== "undefined" && module2 && module2.exports) {
          module2.exports = QUnit3;
          module2.exports.QUnit = QUnit3;
          exportedModule = true;
        }
        if (typeof exports !== "undefined" && exports) {
          exports.QUnit = QUnit3;
          exportedModule = true;
        }
        if (typeof define === "function" && define.amd) {
          define(function() {
            return QUnit3;
          });
          QUnit3.config.autostart = false;
          exportedModule = true;
        }
        if (self$1 && self$1.WorkerGlobalScope && self$1 instanceof self$1.WorkerGlobalScope) {
          self$1.QUnit = QUnit3;
          exportedModule = true;
        }
        if (!exportedModule) {
          globalThis$1.QUnit = QUnit3;
        }
      }
      function onError2(error) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        if (config2.current) {
          if (config2.current.ignoreGlobalErrors) {
            return true;
          }
          pushFailure2.apply(void 0, [error.message, error.stacktrace || error.fileName + ":" + error.lineNumber].concat(args));
        } else {
          test2("global failure", extend2(function() {
            pushFailure2.apply(void 0, [error.message, error.stacktrace || error.fileName + ":" + error.lineNumber].concat(args));
          }, {
            validTest: true
          }));
        }
        return false;
      }
      function onUnhandledRejection2(reason) {
        var resultInfo = {
          result: false,
          message: reason.message || "error",
          actual: reason,
          source: reason.stack || sourceFromStacktrace(3)
        };
        var currentTest = config2.current;
        if (currentTest) {
          currentTest.assert.pushResult(resultInfo);
        } else {
          test2("global failure", extend2(function(assert2) {
            assert2.pushResult(resultInfo);
          }, {
            validTest: true
          }));
        }
      }
      var QUnit2 = {};
      var globalSuite = new SuiteReport();
      config2.currentModule.suiteReport = globalSuite;
      var globalStartCalled = false;
      var runStarted = false;
      QUnit2.isLocal = window$1 && window$1.location && window$1.location.protocol === "file:";
      QUnit2.version = "2.15.0";
      extend2(QUnit2, {
        config: config2,
        dump: dump2,
        equiv: equiv2,
        is: is2,
        objectType: objectType2,
        on: on2,
        onError: onError2,
        onUnhandledRejection: onUnhandledRejection2,
        pushFailure: pushFailure2,
        assert: Assert.prototype,
        module: module$1,
        test: test2,
        todo: test2.todo,
        skip: test2.skip,
        only: test2.only,
        reset: function() {
          ProcessingQueue.finished = false;
          globalStartCalled = false;
          runStarted = false;
          config2.queue.length = 0;
          config2.modules.length = 0;
          config2.autostart = false;
          [
            "stats",
            "started",
            "updateRate",
            "filter",
            "depth",
            "current",
            "pageLoaded",
            "timeoutHandler",
            "timeout",
            "pollution"
          ].forEach((key) => delete config2[key]);
          const suiteReport = config2.currentModule.suiteReport;
          suiteReport.childSuites.length = 0;
          delete suiteReport._startTime;
          delete suiteReport._endTime;
          config2.modules.push(config2.currentModule);
        },
        start: function start2(count) {
          if (config2.current) {
            throw new Error("QUnit.start cannot be called inside a test context.");
          }
          var globalStartAlreadyCalled = globalStartCalled;
          globalStartCalled = true;
          if (runStarted) {
            throw new Error("Called start() while test already started running");
          }
          if (globalStartAlreadyCalled || count > 1) {
            throw new Error("Called start() outside of a test context too many times");
          }
          if (config2.autostart) {
            throw new Error("Called start() outside of a test context when QUnit.config.autostart was true");
          }
          if (!config2.pageLoaded) {
            config2.autostart = true;
            if (!document) {
              QUnit2.load();
            }
            return;
          }
          scheduleBegin();
        },
        extend: function extend$1() {
          Logger.warn("QUnit.extend is deprecated and will be removed in QUnit 3.0. Please use Object.assign instead.");
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          return extend2.apply(this, args);
        },
        load: function load2() {
          config2.pageLoaded = true;
          extend2(config2, {
            stats: {
              all: 0,
              bad: 0,
              testCount: 0
            },
            started: 0,
            updateRate: 1e3,
            autostart: true,
            filter: ""
          }, true);
          if (!runStarted) {
            config2.blocking = false;
            if (config2.autostart) {
              scheduleBegin();
            }
          }
        },
        stack: function stack2(offset) {
          offset = (offset || 0) + 2;
          return sourceFromStacktrace(offset);
        }
      });
      registerLoggingCallbacks(QUnit2);
      function scheduleBegin() {
        runStarted = true;
        if (setTimeout$1) {
          setTimeout$1(function() {
            begin2();
          });
        } else {
          begin2();
        }
      }
      function unblockAndAdvanceQueue() {
        config2.blocking = false;
        ProcessingQueue.advance();
      }
      function begin2() {
        if (config2.started) {
          unblockAndAdvanceQueue();
          return;
        }
        config2.started = now();
        if (config2.modules[0].name === "" && config2.modules[0].tests.length === 0) {
          config2.modules.shift();
        }
        var l = config2.modules.length;
        var modulesLog = [];
        for (var i = 0; i < l; i++) {
          modulesLog.push({
            name: config2.modules[i].name,
            tests: config2.modules[i].tests
          });
        }
        emit("runStart", globalSuite.start(true));
        runLoggingCallbacks("begin", {
          totalTests: Test.count,
          modules: modulesLog
        }).then(unblockAndAdvanceQueue);
      }
      exportQUnit(QUnit2);
      (function() {
        if (!window$1 || !document) {
          return;
        }
        var config3 = QUnit2.config, hasOwn2 = Object.prototype.hasOwnProperty;
        function storeFixture() {
          if (hasOwn2.call(config3, "fixture")) {
            return;
          }
          var fixture = document.getElementById("qunit-fixture");
          if (fixture) {
            config3.fixture = fixture.cloneNode(true);
          }
        }
        QUnit2.begin(storeFixture);
        function resetFixture() {
          if (config3.fixture == null) {
            return;
          }
          var fixture = document.getElementById("qunit-fixture");
          var resetFixtureType = _typeof(config3.fixture);
          if (resetFixtureType === "string") {
            var newFixture = document.createElement("div");
            newFixture.setAttribute("id", "qunit-fixture");
            newFixture.innerHTML = config3.fixture;
            fixture.parentNode.replaceChild(newFixture, fixture);
          } else {
            var clonedFixture = config3.fixture.cloneNode(true);
            fixture.parentNode.replaceChild(clonedFixture, fixture);
          }
        }
        QUnit2.testStart(resetFixture);
      })();
      (function() {
        var location = typeof window$1 !== "undefined" && window$1.location;
        if (!location) {
          return;
        }
        var urlParams = getUrlParams();
        QUnit2.urlParams = urlParams;
        QUnit2.config.moduleId = [].concat(urlParams.moduleId || []);
        QUnit2.config.testId = [].concat(urlParams.testId || []);
        QUnit2.config.module = urlParams.module;
        QUnit2.config.filter = urlParams.filter;
        if (urlParams.seed === true) {
          QUnit2.config.seed = Math.random().toString(36).slice(2);
        } else if (urlParams.seed) {
          QUnit2.config.seed = urlParams.seed;
        }
        QUnit2.config.urlConfig.push({
          id: "hidepassed",
          label: "Hide passed tests",
          tooltip: "Only show tests and assertions that fail. Stored as query-strings."
        }, {
          id: "noglobals",
          label: "Check for Globals",
          tooltip: "Enabling this will test if any test introduces new properties on the global object (`window` in Browsers). Stored as query-strings."
        }, {
          id: "notrycatch",
          label: "No try-catch",
          tooltip: "Enabling this will run tests outside of a try-catch block. Makes debugging exceptions in IE reasonable. Stored as query-strings."
        });
        QUnit2.begin(function() {
          var i, option, urlConfig = QUnit2.config.urlConfig;
          for (i = 0; i < urlConfig.length; i++) {
            option = QUnit2.config.urlConfig[i];
            if (typeof option !== "string") {
              option = option.id;
            }
            if (QUnit2.config[option] === void 0) {
              QUnit2.config[option] = urlParams[option];
            }
          }
        });
        function getUrlParams() {
          var i, param, name, value;
          var urlParams2 = Object.create(null);
          var params = location.search.slice(1).split("&");
          var length = params.length;
          for (i = 0; i < length; i++) {
            if (params[i]) {
              param = params[i].split("=");
              name = decodeQueryParam(param[0]);
              value = param.length === 1 || decodeQueryParam(param.slice(1).join("="));
              if (name in urlParams2) {
                urlParams2[name] = [].concat(urlParams2[name], value);
              } else {
                urlParams2[name] = value;
              }
            }
          }
          return urlParams2;
        }
        function decodeQueryParam(param) {
          return decodeURIComponent(param.replace(/\+/g, "%20"));
        }
      })();
      var fuzzysort = createCommonjsModule(function(module3) {
        (function(root, UMD) {
          if (module3.exports)
            module3.exports = UMD();
          else
            root.fuzzysort = UMD();
        })(commonjsGlobal, function UMD() {
          function fuzzysortNew(instanceOptions) {
            var fuzzysort2 = {
              single: function(search, target, options) {
                if (!search)
                  return null;
                if (!isObj(search))
                  search = fuzzysort2.getPreparedSearch(search);
                if (!target)
                  return null;
                if (!isObj(target))
                  target = fuzzysort2.getPrepared(target);
                var allowTypo = options && options.allowTypo !== void 0 ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== void 0 ? instanceOptions.allowTypo : true;
                var algorithm = allowTypo ? fuzzysort2.algorithm : fuzzysort2.algorithmNoTypo;
                return algorithm(search, target, search[0]);
              },
              go: function(search, targets, options) {
                if (!search)
                  return noResults;
                search = fuzzysort2.prepareSearch(search);
                var searchLowerCode = search[0];
                var threshold = options && options.threshold || instanceOptions && instanceOptions.threshold || -9007199254740991;
                var limit = options && options.limit || instanceOptions && instanceOptions.limit || 9007199254740991;
                var allowTypo = options && options.allowTypo !== void 0 ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== void 0 ? instanceOptions.allowTypo : true;
                var algorithm = allowTypo ? fuzzysort2.algorithm : fuzzysort2.algorithmNoTypo;
                var resultsLen = 0;
                var limitedCount = 0;
                var targetsLen = targets.length;
                if (options && options.keys) {
                  var scoreFn = options.scoreFn || defaultScoreFn;
                  var keys = options.keys;
                  var keysLen = keys.length;
                  for (var i = targetsLen - 1; i >= 0; --i) {
                    var obj = targets[i];
                    var objResults = new Array(keysLen);
                    for (var keyI = keysLen - 1; keyI >= 0; --keyI) {
                      var key = keys[keyI];
                      var target = getValue(obj, key);
                      if (!target) {
                        objResults[keyI] = null;
                        continue;
                      }
                      if (!isObj(target))
                        target = fuzzysort2.getPrepared(target);
                      objResults[keyI] = algorithm(search, target, searchLowerCode);
                    }
                    objResults.obj = obj;
                    var score = scoreFn(objResults);
                    if (score === null)
                      continue;
                    if (score < threshold)
                      continue;
                    objResults.score = score;
                    if (resultsLen < limit) {
                      q.add(objResults);
                      ++resultsLen;
                    } else {
                      ++limitedCount;
                      if (score > q.peek().score)
                        q.replaceTop(objResults);
                    }
                  }
                } else if (options && options.key) {
                  var key = options.key;
                  for (var i = targetsLen - 1; i >= 0; --i) {
                    var obj = targets[i];
                    var target = getValue(obj, key);
                    if (!target)
                      continue;
                    if (!isObj(target))
                      target = fuzzysort2.getPrepared(target);
                    var result = algorithm(search, target, searchLowerCode);
                    if (result === null)
                      continue;
                    if (result.score < threshold)
                      continue;
                    result = {
                      target: result.target,
                      _targetLowerCodes: null,
                      _nextBeginningIndexes: null,
                      score: result.score,
                      indexes: result.indexes,
                      obj
                    };
                    if (resultsLen < limit) {
                      q.add(result);
                      ++resultsLen;
                    } else {
                      ++limitedCount;
                      if (result.score > q.peek().score)
                        q.replaceTop(result);
                    }
                  }
                } else {
                  for (var i = targetsLen - 1; i >= 0; --i) {
                    var target = targets[i];
                    if (!target)
                      continue;
                    if (!isObj(target))
                      target = fuzzysort2.getPrepared(target);
                    var result = algorithm(search, target, searchLowerCode);
                    if (result === null)
                      continue;
                    if (result.score < threshold)
                      continue;
                    if (resultsLen < limit) {
                      q.add(result);
                      ++resultsLen;
                    } else {
                      ++limitedCount;
                      if (result.score > q.peek().score)
                        q.replaceTop(result);
                    }
                  }
                }
                if (resultsLen === 0)
                  return noResults;
                var results = new Array(resultsLen);
                for (var i = resultsLen - 1; i >= 0; --i)
                  results[i] = q.poll();
                results.total = resultsLen + limitedCount;
                return results;
              },
              goAsync: function(search, targets, options) {
                var canceled = false;
                var p = new Promise(function(resolve, reject) {
                  if (!search)
                    return resolve(noResults);
                  search = fuzzysort2.prepareSearch(search);
                  var searchLowerCode = search[0];
                  var q2 = fastpriorityqueue();
                  var iCurrent = targets.length - 1;
                  var threshold = options && options.threshold || instanceOptions && instanceOptions.threshold || -9007199254740991;
                  var limit = options && options.limit || instanceOptions && instanceOptions.limit || 9007199254740991;
                  var allowTypo = options && options.allowTypo !== void 0 ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== void 0 ? instanceOptions.allowTypo : true;
                  var algorithm = allowTypo ? fuzzysort2.algorithm : fuzzysort2.algorithmNoTypo;
                  var resultsLen = 0;
                  var limitedCount = 0;
                  function step() {
                    if (canceled)
                      return reject("canceled");
                    var startMs = Date.now();
                    if (options && options.keys) {
                      var scoreFn = options.scoreFn || defaultScoreFn;
                      var keys = options.keys;
                      var keysLen = keys.length;
                      for (; iCurrent >= 0; --iCurrent) {
                        var obj = targets[iCurrent];
                        var objResults = new Array(keysLen);
                        for (var keyI = keysLen - 1; keyI >= 0; --keyI) {
                          var key = keys[keyI];
                          var target = getValue(obj, key);
                          if (!target) {
                            objResults[keyI] = null;
                            continue;
                          }
                          if (!isObj(target))
                            target = fuzzysort2.getPrepared(target);
                          objResults[keyI] = algorithm(search, target, searchLowerCode);
                        }
                        objResults.obj = obj;
                        var score = scoreFn(objResults);
                        if (score === null)
                          continue;
                        if (score < threshold)
                          continue;
                        objResults.score = score;
                        if (resultsLen < limit) {
                          q2.add(objResults);
                          ++resultsLen;
                        } else {
                          ++limitedCount;
                          if (score > q2.peek().score)
                            q2.replaceTop(objResults);
                        }
                        if (iCurrent % 1e3 === 0) {
                          if (Date.now() - startMs >= 10) {
                            isNode ? setImmediate(step) : setTimeout(step);
                            return;
                          }
                        }
                      }
                    } else if (options && options.key) {
                      var key = options.key;
                      for (; iCurrent >= 0; --iCurrent) {
                        var obj = targets[iCurrent];
                        var target = getValue(obj, key);
                        if (!target)
                          continue;
                        if (!isObj(target))
                          target = fuzzysort2.getPrepared(target);
                        var result = algorithm(search, target, searchLowerCode);
                        if (result === null)
                          continue;
                        if (result.score < threshold)
                          continue;
                        result = {
                          target: result.target,
                          _targetLowerCodes: null,
                          _nextBeginningIndexes: null,
                          score: result.score,
                          indexes: result.indexes,
                          obj
                        };
                        if (resultsLen < limit) {
                          q2.add(result);
                          ++resultsLen;
                        } else {
                          ++limitedCount;
                          if (result.score > q2.peek().score)
                            q2.replaceTop(result);
                        }
                        if (iCurrent % 1e3 === 0) {
                          if (Date.now() - startMs >= 10) {
                            isNode ? setImmediate(step) : setTimeout(step);
                            return;
                          }
                        }
                      }
                    } else {
                      for (; iCurrent >= 0; --iCurrent) {
                        var target = targets[iCurrent];
                        if (!target)
                          continue;
                        if (!isObj(target))
                          target = fuzzysort2.getPrepared(target);
                        var result = algorithm(search, target, searchLowerCode);
                        if (result === null)
                          continue;
                        if (result.score < threshold)
                          continue;
                        if (resultsLen < limit) {
                          q2.add(result);
                          ++resultsLen;
                        } else {
                          ++limitedCount;
                          if (result.score > q2.peek().score)
                            q2.replaceTop(result);
                        }
                        if (iCurrent % 1e3 === 0) {
                          if (Date.now() - startMs >= 10) {
                            isNode ? setImmediate(step) : setTimeout(step);
                            return;
                          }
                        }
                      }
                    }
                    if (resultsLen === 0)
                      return resolve(noResults);
                    var results = new Array(resultsLen);
                    for (var i = resultsLen - 1; i >= 0; --i)
                      results[i] = q2.poll();
                    results.total = resultsLen + limitedCount;
                    resolve(results);
                  }
                  isNode ? setImmediate(step) : step();
                });
                p.cancel = function() {
                  canceled = true;
                };
                return p;
              },
              highlight: function(result, hOpen, hClose) {
                if (result === null)
                  return null;
                if (hOpen === void 0)
                  hOpen = "<b>";
                if (hClose === void 0)
                  hClose = "</b>";
                var highlighted = "";
                var matchesIndex = 0;
                var opened = false;
                var target = result.target;
                var targetLen = target.length;
                var matchesBest = result.indexes;
                for (var i = 0; i < targetLen; ++i) {
                  var char = target[i];
                  if (matchesBest[matchesIndex] === i) {
                    ++matchesIndex;
                    if (!opened) {
                      opened = true;
                      highlighted += hOpen;
                    }
                    if (matchesIndex === matchesBest.length) {
                      highlighted += char + hClose + target.substr(i + 1);
                      break;
                    }
                  } else {
                    if (opened) {
                      opened = false;
                      highlighted += hClose;
                    }
                  }
                  highlighted += char;
                }
                return highlighted;
              },
              prepare: function(target) {
                if (!target)
                  return;
                return {
                  target,
                  _targetLowerCodes: fuzzysort2.prepareLowerCodes(target),
                  _nextBeginningIndexes: null,
                  score: null,
                  indexes: null,
                  obj: null
                };
              },
              prepareSlow: function(target) {
                if (!target)
                  return;
                return {
                  target,
                  _targetLowerCodes: fuzzysort2.prepareLowerCodes(target),
                  _nextBeginningIndexes: fuzzysort2.prepareNextBeginningIndexes(target),
                  score: null,
                  indexes: null,
                  obj: null
                };
              },
              prepareSearch: function(search) {
                if (!search)
                  return;
                return fuzzysort2.prepareLowerCodes(search);
              },
              getPrepared: function(target) {
                if (target.length > 999)
                  return fuzzysort2.prepare(target);
                var targetPrepared = preparedCache.get(target);
                if (targetPrepared !== void 0)
                  return targetPrepared;
                targetPrepared = fuzzysort2.prepare(target);
                preparedCache.set(target, targetPrepared);
                return targetPrepared;
              },
              getPreparedSearch: function(search) {
                if (search.length > 999)
                  return fuzzysort2.prepareSearch(search);
                var searchPrepared = preparedSearchCache.get(search);
                if (searchPrepared !== void 0)
                  return searchPrepared;
                searchPrepared = fuzzysort2.prepareSearch(search);
                preparedSearchCache.set(search, searchPrepared);
                return searchPrepared;
              },
              algorithm: function(searchLowerCodes, prepared, searchLowerCode) {
                var targetLowerCodes = prepared._targetLowerCodes;
                var searchLen = searchLowerCodes.length;
                var targetLen = targetLowerCodes.length;
                var searchI = 0;
                var targetI = 0;
                var typoSimpleI = 0;
                var matchesSimpleLen = 0;
                for (; ; ) {
                  var isMatch = searchLowerCode === targetLowerCodes[targetI];
                  if (isMatch) {
                    matchesSimple[matchesSimpleLen++] = targetI;
                    ++searchI;
                    if (searchI === searchLen)
                      break;
                    searchLowerCode = searchLowerCodes[typoSimpleI === 0 ? searchI : typoSimpleI === searchI ? searchI + 1 : typoSimpleI === searchI - 1 ? searchI - 1 : searchI];
                  }
                  ++targetI;
                  if (targetI >= targetLen) {
                    for (; ; ) {
                      if (searchI <= 1)
                        return null;
                      if (typoSimpleI === 0) {
                        --searchI;
                        var searchLowerCodeNew = searchLowerCodes[searchI];
                        if (searchLowerCode === searchLowerCodeNew)
                          continue;
                        typoSimpleI = searchI;
                      } else {
                        if (typoSimpleI === 1)
                          return null;
                        --typoSimpleI;
                        searchI = typoSimpleI;
                        searchLowerCode = searchLowerCodes[searchI + 1];
                        var searchLowerCodeNew = searchLowerCodes[searchI];
                        if (searchLowerCode === searchLowerCodeNew)
                          continue;
                      }
                      matchesSimpleLen = searchI;
                      targetI = matchesSimple[matchesSimpleLen - 1] + 1;
                      break;
                    }
                  }
                }
                var searchI = 0;
                var typoStrictI = 0;
                var successStrict = false;
                var matchesStrictLen = 0;
                var nextBeginningIndexes = prepared._nextBeginningIndexes;
                if (nextBeginningIndexes === null)
                  nextBeginningIndexes = prepared._nextBeginningIndexes = fuzzysort2.prepareNextBeginningIndexes(prepared.target);
                var firstPossibleI = targetI = matchesSimple[0] === 0 ? 0 : nextBeginningIndexes[matchesSimple[0] - 1];
                if (targetI !== targetLen)
                  for (; ; ) {
                    if (targetI >= targetLen) {
                      if (searchI <= 0) {
                        ++typoStrictI;
                        if (typoStrictI > searchLen - 2)
                          break;
                        if (searchLowerCodes[typoStrictI] === searchLowerCodes[typoStrictI + 1])
                          continue;
                        targetI = firstPossibleI;
                        continue;
                      }
                      --searchI;
                      var lastMatch = matchesStrict[--matchesStrictLen];
                      targetI = nextBeginningIndexes[lastMatch];
                    } else {
                      var isMatch = searchLowerCodes[typoStrictI === 0 ? searchI : typoStrictI === searchI ? searchI + 1 : typoStrictI === searchI - 1 ? searchI - 1 : searchI] === targetLowerCodes[targetI];
                      if (isMatch) {
                        matchesStrict[matchesStrictLen++] = targetI;
                        ++searchI;
                        if (searchI === searchLen) {
                          successStrict = true;
                          break;
                        }
                        ++targetI;
                      } else {
                        targetI = nextBeginningIndexes[targetI];
                      }
                    }
                  }
                {
                  if (successStrict) {
                    var matchesBest = matchesStrict;
                    var matchesBestLen = matchesStrictLen;
                  } else {
                    var matchesBest = matchesSimple;
                    var matchesBestLen = matchesSimpleLen;
                  }
                  var score = 0;
                  var lastTargetI = -1;
                  for (var i = 0; i < searchLen; ++i) {
                    var targetI = matchesBest[i];
                    if (lastTargetI !== targetI - 1)
                      score -= targetI;
                    lastTargetI = targetI;
                  }
                  if (!successStrict) {
                    score *= 1e3;
                    if (typoSimpleI !== 0)
                      score += -20;
                  } else {
                    if (typoStrictI !== 0)
                      score += -20;
                  }
                  score -= targetLen - searchLen;
                  prepared.score = score;
                  prepared.indexes = new Array(matchesBestLen);
                  for (var i = matchesBestLen - 1; i >= 0; --i)
                    prepared.indexes[i] = matchesBest[i];
                  return prepared;
                }
              },
              algorithmNoTypo: function(searchLowerCodes, prepared, searchLowerCode) {
                var targetLowerCodes = prepared._targetLowerCodes;
                var searchLen = searchLowerCodes.length;
                var targetLen = targetLowerCodes.length;
                var searchI = 0;
                var targetI = 0;
                var matchesSimpleLen = 0;
                for (; ; ) {
                  var isMatch = searchLowerCode === targetLowerCodes[targetI];
                  if (isMatch) {
                    matchesSimple[matchesSimpleLen++] = targetI;
                    ++searchI;
                    if (searchI === searchLen)
                      break;
                    searchLowerCode = searchLowerCodes[searchI];
                  }
                  ++targetI;
                  if (targetI >= targetLen)
                    return null;
                }
                var searchI = 0;
                var successStrict = false;
                var matchesStrictLen = 0;
                var nextBeginningIndexes = prepared._nextBeginningIndexes;
                if (nextBeginningIndexes === null)
                  nextBeginningIndexes = prepared._nextBeginningIndexes = fuzzysort2.prepareNextBeginningIndexes(prepared.target);
                targetI = matchesSimple[0] === 0 ? 0 : nextBeginningIndexes[matchesSimple[0] - 1];
                if (targetI !== targetLen)
                  for (; ; ) {
                    if (targetI >= targetLen) {
                      if (searchI <= 0)
                        break;
                      --searchI;
                      var lastMatch = matchesStrict[--matchesStrictLen];
                      targetI = nextBeginningIndexes[lastMatch];
                    } else {
                      var isMatch = searchLowerCodes[searchI] === targetLowerCodes[targetI];
                      if (isMatch) {
                        matchesStrict[matchesStrictLen++] = targetI;
                        ++searchI;
                        if (searchI === searchLen) {
                          successStrict = true;
                          break;
                        }
                        ++targetI;
                      } else {
                        targetI = nextBeginningIndexes[targetI];
                      }
                    }
                  }
                {
                  if (successStrict) {
                    var matchesBest = matchesStrict;
                    var matchesBestLen = matchesStrictLen;
                  } else {
                    var matchesBest = matchesSimple;
                    var matchesBestLen = matchesSimpleLen;
                  }
                  var score = 0;
                  var lastTargetI = -1;
                  for (var i = 0; i < searchLen; ++i) {
                    var targetI = matchesBest[i];
                    if (lastTargetI !== targetI - 1)
                      score -= targetI;
                    lastTargetI = targetI;
                  }
                  if (!successStrict)
                    score *= 1e3;
                  score -= targetLen - searchLen;
                  prepared.score = score;
                  prepared.indexes = new Array(matchesBestLen);
                  for (var i = matchesBestLen - 1; i >= 0; --i)
                    prepared.indexes[i] = matchesBest[i];
                  return prepared;
                }
              },
              prepareLowerCodes: function(str) {
                var strLen = str.length;
                var lowerCodes = [];
                var lower = str.toLowerCase();
                for (var i = 0; i < strLen; ++i)
                  lowerCodes[i] = lower.charCodeAt(i);
                return lowerCodes;
              },
              prepareBeginningIndexes: function(target) {
                var targetLen = target.length;
                var beginningIndexes = [];
                var beginningIndexesLen = 0;
                var wasUpper = false;
                var wasAlphanum = false;
                for (var i = 0; i < targetLen; ++i) {
                  var targetCode = target.charCodeAt(i);
                  var isUpper = targetCode >= 65 && targetCode <= 90;
                  var isAlphanum = isUpper || targetCode >= 97 && targetCode <= 122 || targetCode >= 48 && targetCode <= 57;
                  var isBeginning = isUpper && !wasUpper || !wasAlphanum || !isAlphanum;
                  wasUpper = isUpper;
                  wasAlphanum = isAlphanum;
                  if (isBeginning)
                    beginningIndexes[beginningIndexesLen++] = i;
                }
                return beginningIndexes;
              },
              prepareNextBeginningIndexes: function(target) {
                var targetLen = target.length;
                var beginningIndexes = fuzzysort2.prepareBeginningIndexes(target);
                var nextBeginningIndexes = [];
                var lastIsBeginning = beginningIndexes[0];
                var lastIsBeginningI = 0;
                for (var i = 0; i < targetLen; ++i) {
                  if (lastIsBeginning > i) {
                    nextBeginningIndexes[i] = lastIsBeginning;
                  } else {
                    lastIsBeginning = beginningIndexes[++lastIsBeginningI];
                    nextBeginningIndexes[i] = lastIsBeginning === void 0 ? targetLen : lastIsBeginning;
                  }
                }
                return nextBeginningIndexes;
              },
              cleanup,
              new: fuzzysortNew
            };
            return fuzzysort2;
          }
          var isNode = typeof commonjsRequire !== "undefined" && typeof window === "undefined";
          var preparedCache = new Map();
          var preparedSearchCache = new Map();
          var noResults = [];
          noResults.total = 0;
          var matchesSimple = [];
          var matchesStrict = [];
          function cleanup() {
            preparedCache.clear();
            preparedSearchCache.clear();
            matchesSimple = [];
            matchesStrict = [];
          }
          function defaultScoreFn(a) {
            var max = -9007199254740991;
            for (var i = a.length - 1; i >= 0; --i) {
              var result = a[i];
              if (result === null)
                continue;
              var score = result.score;
              if (score > max)
                max = score;
            }
            if (max === -9007199254740991)
              return null;
            return max;
          }
          function getValue(obj, prop) {
            var tmp = obj[prop];
            if (tmp !== void 0)
              return tmp;
            var segs = prop;
            if (!Array.isArray(prop))
              segs = prop.split(".");
            var len = segs.length;
            var i = -1;
            while (obj && ++i < len)
              obj = obj[segs[i]];
            return obj;
          }
          function isObj(x) {
            return typeof x === "object";
          }
          var fastpriorityqueue = function() {
            var r = [], o = 0, e = {};
            function n() {
              for (var e2 = 0, n2 = r[e2], c = 1; c < o; ) {
                var f = c + 1;
                e2 = c, f < o && r[f].score < r[c].score && (e2 = f), r[e2 - 1 >> 1] = r[e2], c = 1 + (e2 << 1);
              }
              for (var a = e2 - 1 >> 1; e2 > 0 && n2.score < r[a].score; a = (e2 = a) - 1 >> 1)
                r[e2] = r[a];
              r[e2] = n2;
            }
            return e.add = function(e2) {
              var n2 = o;
              r[o++] = e2;
              for (var c = n2 - 1 >> 1; n2 > 0 && e2.score < r[c].score; c = (n2 = c) - 1 >> 1)
                r[n2] = r[c];
              r[n2] = e2;
            }, e.poll = function() {
              if (o !== 0) {
                var e2 = r[0];
                return r[0] = r[--o], n(), e2;
              }
            }, e.peek = function(e2) {
              if (o !== 0)
                return r[0];
            }, e.replaceTop = function(o2) {
              r[0] = o2, n();
            }, e;
          };
          var q = fastpriorityqueue();
          return fuzzysortNew();
        });
      });
      var stats = {
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        todoTests: 0
      };
      function escapeText(s) {
        if (!s) {
          return "";
        }
        s = s + "";
        return s.replace(/['"<>&]/g, function(s2) {
          switch (s2) {
            case "'":
              return "&#039;";
            case '"':
              return "&quot;";
            case "<":
              return "&lt;";
            case ">":
              return "&gt;";
            case "&":
              return "&amp;";
          }
        });
      }
      (function() {
        if (!window$1 || !document) {
          return;
        }
        var config3 = QUnit2.config, hiddenTests = [], collapseNext = false, hasOwn2 = Object.prototype.hasOwnProperty, unfilteredUrl = setUrl({
          filter: void 0,
          module: void 0,
          moduleId: void 0,
          testId: void 0
        });
        function trim(string) {
          if (typeof string.trim === "function") {
            return string.trim();
          } else {
            return string.replace(/^\s+|\s+$/g, "");
          }
        }
        function addEvent(elem, type, fn) {
          elem.addEventListener(type, fn, false);
        }
        function removeEvent(elem, type, fn) {
          elem.removeEventListener(type, fn, false);
        }
        function addEvents(elems, type, fn) {
          var i = elems.length;
          while (i--) {
            addEvent(elems[i], type, fn);
          }
        }
        function hasClass(elem, name) {
          return (" " + elem.className + " ").indexOf(" " + name + " ") >= 0;
        }
        function addClass(elem, name) {
          if (!hasClass(elem, name)) {
            elem.className += (elem.className ? " " : "") + name;
          }
        }
        function toggleClass(elem, name, force) {
          if (force || typeof force === "undefined" && !hasClass(elem, name)) {
            addClass(elem, name);
          } else {
            removeClass(elem, name);
          }
        }
        function removeClass(elem, name) {
          var set = " " + elem.className + " ";
          while (set.indexOf(" " + name + " ") >= 0) {
            set = set.replace(" " + name + " ", " ");
          }
          elem.className = trim(set);
        }
        function id(name) {
          return document.getElementById && document.getElementById(name);
        }
        function abortTests() {
          var abortButton = id("qunit-abort-tests-button");
          if (abortButton) {
            abortButton.disabled = true;
            abortButton.innerHTML = "Aborting...";
          }
          QUnit2.config.queue.length = 0;
          return false;
        }
        function interceptNavigation(ev) {
          var filterInputElem = id("qunit-filter-input");
          filterInputElem.value = trim(filterInputElem.value);
          applyUrlParams();
          if (ev && ev.preventDefault) {
            ev.preventDefault();
          }
          return false;
        }
        function getUrlConfigHtml() {
          var i, j, val, escaped, escapedTooltip, selection = false, urlConfig = config3.urlConfig, urlConfigHtml = "";
          for (i = 0; i < urlConfig.length; i++) {
            val = config3.urlConfig[i];
            if (typeof val === "string") {
              val = {
                id: val,
                label: val
              };
            }
            escaped = escapeText(val.id);
            escapedTooltip = escapeText(val.tooltip);
            if (!val.value || typeof val.value === "string") {
              urlConfigHtml += "<label for='qunit-urlconfig-" + escaped + "' title='" + escapedTooltip + "'><input id='qunit-urlconfig-" + escaped + "' name='" + escaped + "' type='checkbox'" + (val.value ? " value='" + escapeText(val.value) + "'" : "") + (config3[val.id] ? " checked='checked'" : "") + " title='" + escapedTooltip + "' />" + escapeText(val.label) + "</label>";
            } else {
              urlConfigHtml += "<label for='qunit-urlconfig-" + escaped + "' title='" + escapedTooltip + "'>" + val.label + ": </label><select id='qunit-urlconfig-" + escaped + "' name='" + escaped + "' title='" + escapedTooltip + "'><option></option>";
              if (QUnit2.is("array", val.value)) {
                for (j = 0; j < val.value.length; j++) {
                  escaped = escapeText(val.value[j]);
                  urlConfigHtml += "<option value='" + escaped + "'" + (config3[val.id] === val.value[j] ? (selection = true) && " selected='selected'" : "") + ">" + escaped + "</option>";
                }
              } else {
                for (j in val.value) {
                  if (hasOwn2.call(val.value, j)) {
                    urlConfigHtml += "<option value='" + escapeText(j) + "'" + (config3[val.id] === j ? (selection = true) && " selected='selected'" : "") + ">" + escapeText(val.value[j]) + "</option>";
                  }
                }
              }
              if (config3[val.id] && !selection) {
                escaped = escapeText(config3[val.id]);
                urlConfigHtml += "<option value='" + escaped + "' selected='selected' disabled='disabled'>" + escaped + "</option>";
              }
              urlConfigHtml += "</select>";
            }
          }
          return urlConfigHtml;
        }
        function toolbarChanged() {
          var updatedUrl, value, tests, field = this, params = {};
          if ("selectedIndex" in field) {
            value = field.options[field.selectedIndex].value || void 0;
          } else {
            value = field.checked ? field.defaultValue || true : void 0;
          }
          params[field.name] = value;
          updatedUrl = setUrl(params);
          if (field.name === "hidepassed" && "replaceState" in window$1.history) {
            QUnit2.urlParams[field.name] = value;
            config3[field.name] = value || false;
            tests = id("qunit-tests");
            if (tests) {
              var length = tests.children.length;
              var children = tests.children;
              if (field.checked) {
                for (var i = 0; i < length; i++) {
                  var test3 = children[i];
                  var className = test3 ? test3.className : "";
                  var classNameHasPass = className.indexOf("pass") > -1;
                  var classNameHasSkipped = className.indexOf("skipped") > -1;
                  if (classNameHasPass || classNameHasSkipped) {
                    hiddenTests.push(test3);
                  }
                }
                var _iterator = _createForOfIteratorHelper(hiddenTests), _step;
                try {
                  for (_iterator.s(); !(_step = _iterator.n()).done; ) {
                    var hiddenTest = _step.value;
                    tests.removeChild(hiddenTest);
                  }
                } catch (err) {
                  _iterator.e(err);
                } finally {
                  _iterator.f();
                }
              } else {
                while ((test3 = hiddenTests.pop()) != null) {
                  tests.appendChild(test3);
                }
              }
            }
            window$1.history.replaceState(null, "", updatedUrl);
          } else {
            window$1.location = updatedUrl;
          }
        }
        function setUrl(params) {
          var key, arrValue, i, querystring = "?", location = window$1.location;
          params = extend2(extend2({}, QUnit2.urlParams), params);
          for (key in params) {
            if (hasOwn2.call(params, key) && params[key] !== void 0) {
              arrValue = [].concat(params[key]);
              for (i = 0; i < arrValue.length; i++) {
                querystring += encodeURIComponent(key);
                if (arrValue[i] !== true) {
                  querystring += "=" + encodeURIComponent(arrValue[i]);
                }
                querystring += "&";
              }
            }
          }
          return location.protocol + "//" + location.host + location.pathname + querystring.slice(0, -1);
        }
        function applyUrlParams() {
          var i, selectedModules = [], modulesList = id("qunit-modulefilter-dropdown-list").getElementsByTagName("input"), filter = id("qunit-filter-input").value;
          for (i = 0; i < modulesList.length; i++) {
            if (modulesList[i].checked) {
              selectedModules.push(modulesList[i].value);
            }
          }
          window$1.location = setUrl({
            filter: filter === "" ? void 0 : filter,
            moduleId: selectedModules.length === 0 ? void 0 : selectedModules,
            module: void 0,
            testId: void 0
          });
        }
        function toolbarUrlConfigContainer() {
          var urlConfigContainer = document.createElement("span");
          urlConfigContainer.innerHTML = getUrlConfigHtml();
          addClass(urlConfigContainer, "qunit-url-config");
          addEvents(urlConfigContainer.getElementsByTagName("input"), "change", toolbarChanged);
          addEvents(urlConfigContainer.getElementsByTagName("select"), "change", toolbarChanged);
          return urlConfigContainer;
        }
        function abortTestsButton() {
          var button = document.createElement("button");
          button.id = "qunit-abort-tests-button";
          button.innerHTML = "Abort";
          addEvent(button, "click", abortTests);
          return button;
        }
        function toolbarLooseFilter() {
          var filter = document.createElement("form"), label = document.createElement("label"), input = document.createElement("input"), button = document.createElement("button");
          addClass(filter, "qunit-filter");
          label.innerHTML = "Filter: ";
          input.type = "text";
          input.value = config3.filter || "";
          input.name = "filter";
          input.id = "qunit-filter-input";
          button.innerHTML = "Go";
          label.appendChild(input);
          filter.appendChild(label);
          filter.appendChild(document.createTextNode(" "));
          filter.appendChild(button);
          addEvent(filter, "submit", interceptNavigation);
          return filter;
        }
        function moduleListHtml(modules) {
          var i, checked, html = "";
          for (i = 0; i < modules.length; i++) {
            if (modules[i].name !== "") {
              checked = config3.moduleId.indexOf(modules[i].moduleId) > -1;
              html += "<li><label class='clickable" + (checked ? " checked" : "") + "'><input type='checkbox' value='" + modules[i].moduleId + "'" + (checked ? " checked='checked'" : "") + " />" + escapeText(modules[i].name) + "</label></li>";
            }
          }
          return html;
        }
        function toolbarModuleFilter() {
          var commit, reset, moduleFilter = document.createElement("form"), label = document.createElement("label"), moduleSearch = document.createElement("input"), dropDown = document.createElement("div"), actions = document.createElement("span"), applyButton = document.createElement("button"), resetButton = document.createElement("button"), allModulesLabel = document.createElement("label"), allCheckbox = document.createElement("input"), dropDownList = document.createElement("ul"), dirty = false;
          moduleSearch.id = "qunit-modulefilter-search";
          moduleSearch.autocomplete = "off";
          addEvent(moduleSearch, "input", searchInput);
          addEvent(moduleSearch, "input", searchFocus);
          addEvent(moduleSearch, "focus", searchFocus);
          addEvent(moduleSearch, "click", searchFocus);
          config3.modules.forEach(function(module3) {
            return module3.namePrepared = fuzzysort.prepare(module3.name);
          });
          label.id = "qunit-modulefilter-search-container";
          label.innerHTML = "Module: ";
          label.appendChild(moduleSearch);
          applyButton.textContent = "Apply";
          applyButton.style.display = "none";
          resetButton.textContent = "Reset";
          resetButton.type = "reset";
          resetButton.style.display = "none";
          allCheckbox.type = "checkbox";
          allCheckbox.checked = config3.moduleId.length === 0;
          allModulesLabel.className = "clickable";
          if (config3.moduleId.length) {
            allModulesLabel.className = "checked";
          }
          allModulesLabel.appendChild(allCheckbox);
          allModulesLabel.appendChild(document.createTextNode("All modules"));
          actions.id = "qunit-modulefilter-actions";
          actions.appendChild(applyButton);
          actions.appendChild(resetButton);
          actions.appendChild(allModulesLabel);
          commit = actions.firstChild;
          reset = commit.nextSibling;
          addEvent(commit, "click", applyUrlParams);
          dropDownList.id = "qunit-modulefilter-dropdown-list";
          dropDownList.innerHTML = moduleListHtml(config3.modules);
          dropDown.id = "qunit-modulefilter-dropdown";
          dropDown.style.display = "none";
          dropDown.appendChild(actions);
          dropDown.appendChild(dropDownList);
          addEvent(dropDown, "change", selectionChange);
          selectionChange();
          moduleFilter.id = "qunit-modulefilter";
          moduleFilter.appendChild(label);
          moduleFilter.appendChild(dropDown);
          addEvent(moduleFilter, "submit", interceptNavigation);
          addEvent(moduleFilter, "reset", function() {
            window$1.setTimeout(selectionChange);
          });
          function searchFocus() {
            if (dropDown.style.display !== "none") {
              return;
            }
            dropDown.style.display = "block";
            addEvent(document, "click", hideHandler);
            addEvent(document, "keydown", hideHandler);
            function hideHandler(e) {
              var inContainer = moduleFilter.contains(e.target);
              if (e.keyCode === 27 || !inContainer) {
                if (e.keyCode === 27 && inContainer) {
                  moduleSearch.focus();
                }
                dropDown.style.display = "none";
                removeEvent(document, "click", hideHandler);
                removeEvent(document, "keydown", hideHandler);
                moduleSearch.value = "";
                searchInput();
              }
            }
          }
          function filterModules(searchText) {
            if (searchText === "") {
              return config3.modules;
            }
            return fuzzysort.go(searchText, config3.modules, {
              key: "namePrepared",
              threshold: -1e4
            }).map(function(module3) {
              return module3.obj;
            });
          }
          var searchInputTimeout;
          function searchInput() {
            window$1.clearTimeout(searchInputTimeout);
            searchInputTimeout = window$1.setTimeout(function() {
              var searchText = moduleSearch.value.toLowerCase(), filteredModules = filterModules(searchText);
              dropDownList.innerHTML = moduleListHtml(filteredModules);
            }, 200);
          }
          function selectionChange(evt) {
            var i, item, checkbox = evt && evt.target || allCheckbox, modulesList = dropDownList.getElementsByTagName("input"), selectedNames = [];
            toggleClass(checkbox.parentNode, "checked", checkbox.checked);
            dirty = false;
            if (checkbox.checked && checkbox !== allCheckbox) {
              allCheckbox.checked = false;
              removeClass(allCheckbox.parentNode, "checked");
            }
            for (i = 0; i < modulesList.length; i++) {
              item = modulesList[i];
              if (!evt) {
                toggleClass(item.parentNode, "checked", item.checked);
              } else if (checkbox === allCheckbox && checkbox.checked) {
                item.checked = false;
                removeClass(item.parentNode, "checked");
              }
              dirty = dirty || item.checked !== item.defaultChecked;
              if (item.checked) {
                selectedNames.push(item.parentNode.textContent);
              }
            }
            commit.style.display = reset.style.display = dirty ? "" : "none";
            moduleSearch.placeholder = selectedNames.join(", ") || allCheckbox.parentNode.textContent;
            moduleSearch.title = "Type to filter list. Current selection:\n" + (selectedNames.join("\n") || allCheckbox.parentNode.textContent);
          }
          return moduleFilter;
        }
        function toolbarFilters() {
          var toolbarFilters2 = document.createElement("span");
          toolbarFilters2.id = "qunit-toolbar-filters";
          toolbarFilters2.appendChild(toolbarLooseFilter());
          toolbarFilters2.appendChild(toolbarModuleFilter());
          return toolbarFilters2;
        }
        function appendToolbar() {
          var toolbar = id("qunit-testrunner-toolbar");
          if (toolbar) {
            toolbar.appendChild(toolbarUrlConfigContainer());
            toolbar.appendChild(toolbarFilters());
            toolbar.appendChild(document.createElement("div")).className = "clearfix";
          }
        }
        function appendHeader() {
          var header = id("qunit-header");
          if (header) {
            header.innerHTML = "<a href='" + escapeText(unfilteredUrl) + "'>" + header.innerHTML + "</a> ";
          }
        }
        function appendBanner() {
          var banner = id("qunit-banner");
          if (banner) {
            banner.className = "";
          }
        }
        function appendTestResults() {
          var tests = id("qunit-tests"), result = id("qunit-testresult"), controls;
          if (result) {
            result.parentNode.removeChild(result);
          }
          if (tests) {
            tests.innerHTML = "";
            result = document.createElement("p");
            result.id = "qunit-testresult";
            result.className = "result";
            tests.parentNode.insertBefore(result, tests);
            result.innerHTML = '<div id="qunit-testresult-display">Running...<br />&#160;</div><div id="qunit-testresult-controls"></div><div class="clearfix"></div>';
            controls = id("qunit-testresult-controls");
          }
          if (controls) {
            controls.appendChild(abortTestsButton());
          }
        }
        function appendFilteredTest() {
          var testId = QUnit2.config.testId;
          if (!testId || testId.length <= 0) {
            return "";
          }
          return "<div id='qunit-filteredTest'>Rerunning selected tests: " + escapeText(testId.join(", ")) + " <a id='qunit-clearFilter' href='" + escapeText(unfilteredUrl) + "'>Run all tests</a></div>";
        }
        function appendUserAgent() {
          var userAgent = id("qunit-userAgent");
          if (userAgent) {
            userAgent.innerHTML = "";
            userAgent.appendChild(document.createTextNode("QUnit " + QUnit2.version + "; " + navigator.userAgent));
          }
        }
        function appendInterface() {
          var qunit = id("qunit");
          if (qunit) {
            qunit.setAttribute("role", "main");
            qunit.innerHTML = "<h1 id='qunit-header'>" + escapeText(document.title) + "</h1><h2 id='qunit-banner'></h2><div id='qunit-testrunner-toolbar' role='navigation'></div>" + appendFilteredTest() + "<h2 id='qunit-userAgent'></h2><ol id='qunit-tests'></ol>";
          }
          appendHeader();
          appendBanner();
          appendTestResults();
          appendUserAgent();
          appendToolbar();
        }
        function appendTest(name, testId, moduleName) {
          var title, rerunTrigger, testBlock, assertList, tests = id("qunit-tests");
          if (!tests) {
            return;
          }
          title = document.createElement("strong");
          title.innerHTML = getNameHtml(name, moduleName);
          rerunTrigger = document.createElement("a");
          rerunTrigger.innerHTML = "Rerun";
          rerunTrigger.href = setUrl({
            testId
          });
          testBlock = document.createElement("li");
          testBlock.appendChild(title);
          testBlock.appendChild(rerunTrigger);
          testBlock.id = "qunit-test-output-" + testId;
          assertList = document.createElement("ol");
          assertList.className = "qunit-assert-list";
          testBlock.appendChild(assertList);
          tests.appendChild(testBlock);
        }
        QUnit2.begin(function() {
          appendInterface();
        });
        QUnit2.done(function(details) {
          var banner = id("qunit-banner"), tests = id("qunit-tests"), abortButton = id("qunit-abort-tests-button"), totalTests = stats.passedTests + stats.skippedTests + stats.todoTests + stats.failedTests, html = [totalTests, " tests completed in ", details.runtime, " milliseconds, with ", stats.failedTests, " failed, ", stats.skippedTests, " skipped, and ", stats.todoTests, " todo.<br />", "<span class='passed'>", details.passed, "</span> assertions of <span class='total'>", details.total, "</span> passed, <span class='failed'>", details.failed, "</span> failed."].join(""), test3, assertLi, assertList;
          if (abortButton && abortButton.disabled) {
            html = "Tests aborted after " + details.runtime + " milliseconds.";
            for (var i = 0; i < tests.children.length; i++) {
              test3 = tests.children[i];
              if (test3.className === "" || test3.className === "running") {
                test3.className = "aborted";
                assertList = test3.getElementsByTagName("ol")[0];
                assertLi = document.createElement("li");
                assertLi.className = "fail";
                assertLi.innerHTML = "Test aborted.";
                assertList.appendChild(assertLi);
              }
            }
          }
          if (banner && (!abortButton || abortButton.disabled === false)) {
            banner.className = stats.failedTests ? "qunit-fail" : "qunit-pass";
          }
          if (abortButton) {
            abortButton.parentNode.removeChild(abortButton);
          }
          if (tests) {
            id("qunit-testresult-display").innerHTML = html;
          }
          if (config3.altertitle && document.title) {
            document.title = [stats.failedTests ? "\u2716" : "\u2714", document.title.replace(/^[\u2714\u2716] /i, "")].join(" ");
          }
          if (config3.scrolltop && window$1.scrollTo) {
            window$1.scrollTo(0, 0);
          }
        });
        function getNameHtml(name, module3) {
          var nameHtml = "";
          if (module3) {
            nameHtml = "<span class='module-name'>" + escapeText(module3) + "</span>: ";
          }
          nameHtml += "<span class='test-name'>" + escapeText(name) + "</span>";
          return nameHtml;
        }
        function getProgressHtml(runtime, stats2, total) {
          var completed = stats2.passedTests + stats2.skippedTests + stats2.todoTests + stats2.failedTests;
          return ["<br />", completed, " / ", total, " tests completed in ", runtime, " milliseconds, with ", stats2.failedTests, " failed, ", stats2.skippedTests, " skipped, and ", stats2.todoTests, " todo."].join("");
        }
        QUnit2.testStart(function(details) {
          var running, bad;
          appendTest(details.name, details.testId, details.module);
          running = id("qunit-testresult-display");
          if (running) {
            addClass(running, "running");
            bad = QUnit2.config.reorder && details.previousFailure;
            running.innerHTML = [bad ? "Rerunning previously failed test: <br />" : "Running: <br />", getNameHtml(details.name, details.module), getProgressHtml(now() - config3.started, stats, Test.count)].join("");
          }
        });
        function stripHtml(string) {
          return string.replace(/<\/?[^>]+(>|$)/g, "").replace(/&quot;/g, "").replace(/\s+/g, "");
        }
        QUnit2.log(function(details) {
          var assertList, assertLi, message, expected, actual, diff3, showDiff = false, testItem = id("qunit-test-output-" + details.testId);
          if (!testItem) {
            return;
          }
          message = escapeText(details.message) || (details.result ? "okay" : "failed");
          message = "<span class='test-message'>" + message + "</span>";
          message += "<span class='runtime'>@ " + details.runtime + " ms</span>";
          if (!details.result && hasOwn2.call(details, "expected")) {
            if (details.negative) {
              expected = "NOT " + QUnit2.dump.parse(details.expected);
            } else {
              expected = QUnit2.dump.parse(details.expected);
            }
            actual = QUnit2.dump.parse(details.actual);
            message += "<table><tr class='test-expected'><th>Expected: </th><td><pre>" + escapeText(expected) + "</pre></td></tr>";
            if (actual !== expected) {
              message += "<tr class='test-actual'><th>Result: </th><td><pre>" + escapeText(actual) + "</pre></td></tr>";
              if (typeof details.actual === "number" && typeof details.expected === "number") {
                if (!isNaN(details.actual) && !isNaN(details.expected)) {
                  showDiff = true;
                  diff3 = details.actual - details.expected;
                  diff3 = (diff3 > 0 ? "+" : "") + diff3;
                }
              } else if (typeof details.actual !== "boolean" && typeof details.expected !== "boolean") {
                diff3 = QUnit2.diff(expected, actual);
                showDiff = stripHtml(diff3).length !== stripHtml(expected).length + stripHtml(actual).length;
              }
              if (showDiff) {
                message += "<tr class='test-diff'><th>Diff: </th><td><pre>" + diff3 + "</pre></td></tr>";
              }
            } else if (expected.indexOf("[object Array]") !== -1 || expected.indexOf("[object Object]") !== -1) {
              message += "<tr class='test-message'><th>Message: </th><td>Diff suppressed as the depth of object is more than current max depth (" + QUnit2.config.maxDepth + ").<p>Hint: Use <code>QUnit.dump.maxDepth</code> to  run with a higher max depth or <a href='" + escapeText(setUrl({
                maxDepth: -1
              })) + "'>Rerun</a> without max depth.</p></td></tr>";
            } else {
              message += "<tr class='test-message'><th>Message: </th><td>Diff suppressed as the expected and actual results have an equivalent serialization</td></tr>";
            }
            if (details.source) {
              message += "<tr class='test-source'><th>Source: </th><td><pre>" + escapeText(details.source) + "</pre></td></tr>";
            }
            message += "</table>";
          } else if (!details.result && details.source) {
            message += "<table><tr class='test-source'><th>Source: </th><td><pre>" + escapeText(details.source) + "</pre></td></tr></table>";
          }
          assertList = testItem.getElementsByTagName("ol")[0];
          assertLi = document.createElement("li");
          assertLi.className = details.result ? "pass" : "fail";
          assertLi.innerHTML = message;
          assertList.appendChild(assertLi);
        });
        QUnit2.testDone(function(details) {
          var testTitle, time, assertList, status, good, bad, testCounts, skipped, sourceName, tests = id("qunit-tests"), testItem = id("qunit-test-output-" + details.testId);
          if (!tests || !testItem) {
            return;
          }
          removeClass(testItem, "running");
          if (details.failed > 0) {
            status = "failed";
          } else if (details.todo) {
            status = "todo";
          } else {
            status = details.skipped ? "skipped" : "passed";
          }
          assertList = testItem.getElementsByTagName("ol")[0];
          good = details.passed;
          bad = details.failed;
          var testPassed = details.failed > 0 ? details.todo : !details.todo;
          if (testPassed) {
            addClass(assertList, "qunit-collapsed");
          } else if (config3.collapse) {
            if (!collapseNext) {
              collapseNext = true;
            } else {
              addClass(assertList, "qunit-collapsed");
            }
          }
          testTitle = testItem.firstChild;
          testCounts = bad ? "<b class='failed'>" + bad + "</b>, <b class='passed'>" + good + "</b>, " : "";
          testTitle.innerHTML += " <b class='counts'>(" + testCounts + details.assertions.length + ")</b>";
          if (details.skipped) {
            stats.skippedTests++;
            testItem.className = "skipped";
            skipped = document.createElement("em");
            skipped.className = "qunit-skipped-label";
            skipped.innerHTML = "skipped";
            testItem.insertBefore(skipped, testTitle);
          } else {
            addEvent(testTitle, "click", function() {
              toggleClass(assertList, "qunit-collapsed");
            });
            testItem.className = testPassed ? "pass" : "fail";
            if (details.todo) {
              var todoLabel = document.createElement("em");
              todoLabel.className = "qunit-todo-label";
              todoLabel.innerHTML = "todo";
              testItem.className += " todo";
              testItem.insertBefore(todoLabel, testTitle);
            }
            time = document.createElement("span");
            time.className = "runtime";
            time.innerHTML = details.runtime + " ms";
            testItem.insertBefore(time, assertList);
            if (!testPassed) {
              stats.failedTests++;
            } else if (details.todo) {
              stats.todoTests++;
            } else {
              stats.passedTests++;
            }
          }
          if (details.source) {
            sourceName = document.createElement("p");
            sourceName.innerHTML = "<strong>Source: </strong>" + escapeText(details.source);
            addClass(sourceName, "qunit-source");
            if (testPassed) {
              addClass(sourceName, "qunit-collapsed");
            }
            addEvent(testTitle, "click", function() {
              toggleClass(sourceName, "qunit-collapsed");
            });
            testItem.appendChild(sourceName);
          }
          if (config3.hidepassed && (status === "passed" || details.skipped)) {
            hiddenTests.push(testItem);
            tests.removeChild(testItem);
          }
        });
        var usingPhantom = function(p) {
          return p && p.version && p.version.major > 0;
        }(window$1.phantom);
        if (usingPhantom) {
          console$1.warn("Support for PhantomJS is deprecated and will be removed in QUnit 3.0.");
        }
        if (!usingPhantom && document.readyState === "complete") {
          QUnit2.load();
        } else {
          addEvent(window$1, "load", QUnit2.load);
        }
        var originalWindowOnError = window$1.onerror;
        window$1.onerror = function(message, fileName2, lineNumber, columnNumber, errorObj) {
          var ret = false;
          if (originalWindowOnError) {
            for (var _len = arguments.length, args = new Array(_len > 5 ? _len - 5 : 0), _key = 5; _key < _len; _key++) {
              args[_key - 5] = arguments[_key];
            }
            ret = originalWindowOnError.call.apply(originalWindowOnError, [this, message, fileName2, lineNumber, columnNumber, errorObj].concat(args));
          }
          if (ret !== true) {
            var error = {
              message,
              fileName: fileName2,
              lineNumber
            };
            if (errorObj && errorObj.stack) {
              error.stacktrace = extractStacktrace(errorObj, 0);
            }
            ret = QUnit2.onError(error);
          }
          return ret;
        };
        window$1.addEventListener("unhandledrejection", function(event) {
          QUnit2.onUnhandledRejection(event.reason);
        });
      })();
      QUnit2.diff = function() {
        function DiffMatchPatch() {
        }
        var DIFF_DELETE = -1, DIFF_INSERT = 1, DIFF_EQUAL = 0, hasOwn2 = Object.prototype.hasOwnProperty;
        DiffMatchPatch.prototype.DiffMain = function(text1, text2, optChecklines) {
          var deadline, checklines, commonlength, commonprefix, commonsuffix, diffs;
          deadline = new Date().getTime() + 1e3;
          if (text1 === null || text2 === null) {
            throw new Error("Null input. (DiffMain)");
          }
          if (text1 === text2) {
            if (text1) {
              return [[DIFF_EQUAL, text1]];
            }
            return [];
          }
          if (typeof optChecklines === "undefined") {
            optChecklines = true;
          }
          checklines = optChecklines;
          commonlength = this.diffCommonPrefix(text1, text2);
          commonprefix = text1.substring(0, commonlength);
          text1 = text1.substring(commonlength);
          text2 = text2.substring(commonlength);
          commonlength = this.diffCommonSuffix(text1, text2);
          commonsuffix = text1.substring(text1.length - commonlength);
          text1 = text1.substring(0, text1.length - commonlength);
          text2 = text2.substring(0, text2.length - commonlength);
          diffs = this.diffCompute(text1, text2, checklines, deadline);
          if (commonprefix) {
            diffs.unshift([DIFF_EQUAL, commonprefix]);
          }
          if (commonsuffix) {
            diffs.push([DIFF_EQUAL, commonsuffix]);
          }
          this.diffCleanupMerge(diffs);
          return diffs;
        };
        DiffMatchPatch.prototype.diffCleanupEfficiency = function(diffs) {
          var changes, equalities, equalitiesLength, lastequality, pointer, preIns, preDel, postIns, postDel;
          changes = false;
          equalities = [];
          equalitiesLength = 0;
          lastequality = null;
          pointer = 0;
          preIns = false;
          preDel = false;
          postIns = false;
          postDel = false;
          while (pointer < diffs.length) {
            if (diffs[pointer][0] === DIFF_EQUAL) {
              if (diffs[pointer][1].length < 4 && (postIns || postDel)) {
                equalities[equalitiesLength++] = pointer;
                preIns = postIns;
                preDel = postDel;
                lastequality = diffs[pointer][1];
              } else {
                equalitiesLength = 0;
                lastequality = null;
              }
              postIns = postDel = false;
            } else {
              if (diffs[pointer][0] === DIFF_DELETE) {
                postDel = true;
              } else {
                postIns = true;
              }
              if (lastequality && (preIns && preDel && postIns && postDel || lastequality.length < 2 && preIns + preDel + postIns + postDel === 3)) {
                diffs.splice(equalities[equalitiesLength - 1], 0, [DIFF_DELETE, lastequality]);
                diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
                equalitiesLength--;
                lastequality = null;
                if (preIns && preDel) {
                  postIns = postDel = true;
                  equalitiesLength = 0;
                } else {
                  equalitiesLength--;
                  pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
                  postIns = postDel = false;
                }
                changes = true;
              }
            }
            pointer++;
          }
          if (changes) {
            this.diffCleanupMerge(diffs);
          }
        };
        DiffMatchPatch.prototype.diffPrettyHtml = function(diffs) {
          var op, data, x, html = [];
          for (x = 0; x < diffs.length; x++) {
            op = diffs[x][0];
            data = diffs[x][1];
            switch (op) {
              case DIFF_INSERT:
                html[x] = "<ins>" + escapeText(data) + "</ins>";
                break;
              case DIFF_DELETE:
                html[x] = "<del>" + escapeText(data) + "</del>";
                break;
              case DIFF_EQUAL:
                html[x] = "<span>" + escapeText(data) + "</span>";
                break;
            }
          }
          return html.join("");
        };
        DiffMatchPatch.prototype.diffCommonPrefix = function(text1, text2) {
          var pointermid, pointermax, pointermin, pointerstart;
          if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) {
            return 0;
          }
          pointermin = 0;
          pointermax = Math.min(text1.length, text2.length);
          pointermid = pointermax;
          pointerstart = 0;
          while (pointermin < pointermid) {
            if (text1.substring(pointerstart, pointermid) === text2.substring(pointerstart, pointermid)) {
              pointermin = pointermid;
              pointerstart = pointermin;
            } else {
              pointermax = pointermid;
            }
            pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
          }
          return pointermid;
        };
        DiffMatchPatch.prototype.diffCommonSuffix = function(text1, text2) {
          var pointermid, pointermax, pointermin, pointerend;
          if (!text1 || !text2 || text1.charAt(text1.length - 1) !== text2.charAt(text2.length - 1)) {
            return 0;
          }
          pointermin = 0;
          pointermax = Math.min(text1.length, text2.length);
          pointermid = pointermax;
          pointerend = 0;
          while (pointermin < pointermid) {
            if (text1.substring(text1.length - pointermid, text1.length - pointerend) === text2.substring(text2.length - pointermid, text2.length - pointerend)) {
              pointermin = pointermid;
              pointerend = pointermin;
            } else {
              pointermax = pointermid;
            }
            pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
          }
          return pointermid;
        };
        DiffMatchPatch.prototype.diffCompute = function(text1, text2, checklines, deadline) {
          var diffs, longtext, shorttext, i, hm, text1A, text2A, text1B, text2B, midCommon, diffsA, diffsB;
          if (!text1) {
            return [[DIFF_INSERT, text2]];
          }
          if (!text2) {
            return [[DIFF_DELETE, text1]];
          }
          longtext = text1.length > text2.length ? text1 : text2;
          shorttext = text1.length > text2.length ? text2 : text1;
          i = longtext.indexOf(shorttext);
          if (i !== -1) {
            diffs = [[DIFF_INSERT, longtext.substring(0, i)], [DIFF_EQUAL, shorttext], [DIFF_INSERT, longtext.substring(i + shorttext.length)]];
            if (text1.length > text2.length) {
              diffs[0][0] = diffs[2][0] = DIFF_DELETE;
            }
            return diffs;
          }
          if (shorttext.length === 1) {
            return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
          }
          hm = this.diffHalfMatch(text1, text2);
          if (hm) {
            text1A = hm[0];
            text1B = hm[1];
            text2A = hm[2];
            text2B = hm[3];
            midCommon = hm[4];
            diffsA = this.DiffMain(text1A, text2A, checklines, deadline);
            diffsB = this.DiffMain(text1B, text2B, checklines, deadline);
            return diffsA.concat([[DIFF_EQUAL, midCommon]], diffsB);
          }
          if (checklines && text1.length > 100 && text2.length > 100) {
            return this.diffLineMode(text1, text2, deadline);
          }
          return this.diffBisect(text1, text2, deadline);
        };
        DiffMatchPatch.prototype.diffHalfMatch = function(text1, text2) {
          var longtext, shorttext, dmp, text1A, text2B, text2A, text1B, midCommon, hm1, hm2, hm;
          longtext = text1.length > text2.length ? text1 : text2;
          shorttext = text1.length > text2.length ? text2 : text1;
          if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
            return null;
          }
          dmp = this;
          function diffHalfMatchI(longtext2, shorttext2, i) {
            var seed, j, bestCommon, prefixLength, suffixLength, bestLongtextA, bestLongtextB, bestShorttextA, bestShorttextB;
            seed = longtext2.substring(i, i + Math.floor(longtext2.length / 4));
            j = -1;
            bestCommon = "";
            while ((j = shorttext2.indexOf(seed, j + 1)) !== -1) {
              prefixLength = dmp.diffCommonPrefix(longtext2.substring(i), shorttext2.substring(j));
              suffixLength = dmp.diffCommonSuffix(longtext2.substring(0, i), shorttext2.substring(0, j));
              if (bestCommon.length < suffixLength + prefixLength) {
                bestCommon = shorttext2.substring(j - suffixLength, j) + shorttext2.substring(j, j + prefixLength);
                bestLongtextA = longtext2.substring(0, i - suffixLength);
                bestLongtextB = longtext2.substring(i + prefixLength);
                bestShorttextA = shorttext2.substring(0, j - suffixLength);
                bestShorttextB = shorttext2.substring(j + prefixLength);
              }
            }
            if (bestCommon.length * 2 >= longtext2.length) {
              return [bestLongtextA, bestLongtextB, bestShorttextA, bestShorttextB, bestCommon];
            } else {
              return null;
            }
          }
          hm1 = diffHalfMatchI(longtext, shorttext, Math.ceil(longtext.length / 4));
          hm2 = diffHalfMatchI(longtext, shorttext, Math.ceil(longtext.length / 2));
          if (!hm1 && !hm2) {
            return null;
          } else if (!hm2) {
            hm = hm1;
          } else if (!hm1) {
            hm = hm2;
          } else {
            hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
          }
          if (text1.length > text2.length) {
            text1A = hm[0];
            text1B = hm[1];
            text2A = hm[2];
            text2B = hm[3];
          } else {
            text2A = hm[0];
            text2B = hm[1];
            text1A = hm[2];
            text1B = hm[3];
          }
          midCommon = hm[4];
          return [text1A, text1B, text2A, text2B, midCommon];
        };
        DiffMatchPatch.prototype.diffLineMode = function(text1, text2, deadline) {
          var a, diffs, linearray, pointer, countInsert, countDelete, textInsert, textDelete, j;
          a = this.diffLinesToChars(text1, text2);
          text1 = a.chars1;
          text2 = a.chars2;
          linearray = a.lineArray;
          diffs = this.DiffMain(text1, text2, false, deadline);
          this.diffCharsToLines(diffs, linearray);
          this.diffCleanupSemantic(diffs);
          diffs.push([DIFF_EQUAL, ""]);
          pointer = 0;
          countDelete = 0;
          countInsert = 0;
          textDelete = "";
          textInsert = "";
          while (pointer < diffs.length) {
            switch (diffs[pointer][0]) {
              case DIFF_INSERT:
                countInsert++;
                textInsert += diffs[pointer][1];
                break;
              case DIFF_DELETE:
                countDelete++;
                textDelete += diffs[pointer][1];
                break;
              case DIFF_EQUAL:
                if (countDelete >= 1 && countInsert >= 1) {
                  diffs.splice(pointer - countDelete - countInsert, countDelete + countInsert);
                  pointer = pointer - countDelete - countInsert;
                  a = this.DiffMain(textDelete, textInsert, false, deadline);
                  for (j = a.length - 1; j >= 0; j--) {
                    diffs.splice(pointer, 0, a[j]);
                  }
                  pointer = pointer + a.length;
                }
                countInsert = 0;
                countDelete = 0;
                textDelete = "";
                textInsert = "";
                break;
            }
            pointer++;
          }
          diffs.pop();
          return diffs;
        };
        DiffMatchPatch.prototype.diffBisect = function(text1, text2, deadline) {
          var text1Length, text2Length, maxD, vOffset, vLength, v1, v2, x, delta, front, k1start, k1end, k2start, k2end, k2Offset, k1Offset, x1, x2, y1, y2, d, k1, k2;
          text1Length = text1.length;
          text2Length = text2.length;
          maxD = Math.ceil((text1Length + text2Length) / 2);
          vOffset = maxD;
          vLength = 2 * maxD;
          v1 = new Array(vLength);
          v2 = new Array(vLength);
          for (x = 0; x < vLength; x++) {
            v1[x] = -1;
            v2[x] = -1;
          }
          v1[vOffset + 1] = 0;
          v2[vOffset + 1] = 0;
          delta = text1Length - text2Length;
          front = delta % 2 !== 0;
          k1start = 0;
          k1end = 0;
          k2start = 0;
          k2end = 0;
          for (d = 0; d < maxD; d++) {
            if (new Date().getTime() > deadline) {
              break;
            }
            for (k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
              k1Offset = vOffset + k1;
              if (k1 === -d || k1 !== d && v1[k1Offset - 1] < v1[k1Offset + 1]) {
                x1 = v1[k1Offset + 1];
              } else {
                x1 = v1[k1Offset - 1] + 1;
              }
              y1 = x1 - k1;
              while (x1 < text1Length && y1 < text2Length && text1.charAt(x1) === text2.charAt(y1)) {
                x1++;
                y1++;
              }
              v1[k1Offset] = x1;
              if (x1 > text1Length) {
                k1end += 2;
              } else if (y1 > text2Length) {
                k1start += 2;
              } else if (front) {
                k2Offset = vOffset + delta - k1;
                if (k2Offset >= 0 && k2Offset < vLength && v2[k2Offset] !== -1) {
                  x2 = text1Length - v2[k2Offset];
                  if (x1 >= x2) {
                    return this.diffBisectSplit(text1, text2, x1, y1, deadline);
                  }
                }
              }
            }
            for (k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
              k2Offset = vOffset + k2;
              if (k2 === -d || k2 !== d && v2[k2Offset - 1] < v2[k2Offset + 1]) {
                x2 = v2[k2Offset + 1];
              } else {
                x2 = v2[k2Offset - 1] + 1;
              }
              y2 = x2 - k2;
              while (x2 < text1Length && y2 < text2Length && text1.charAt(text1Length - x2 - 1) === text2.charAt(text2Length - y2 - 1)) {
                x2++;
                y2++;
              }
              v2[k2Offset] = x2;
              if (x2 > text1Length) {
                k2end += 2;
              } else if (y2 > text2Length) {
                k2start += 2;
              } else if (!front) {
                k1Offset = vOffset + delta - k2;
                if (k1Offset >= 0 && k1Offset < vLength && v1[k1Offset] !== -1) {
                  x1 = v1[k1Offset];
                  y1 = vOffset + x1 - k1Offset;
                  x2 = text1Length - x2;
                  if (x1 >= x2) {
                    return this.diffBisectSplit(text1, text2, x1, y1, deadline);
                  }
                }
              }
            }
          }
          return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
        };
        DiffMatchPatch.prototype.diffBisectSplit = function(text1, text2, x, y, deadline) {
          var text1a, text1b, text2a, text2b, diffs, diffsb;
          text1a = text1.substring(0, x);
          text2a = text2.substring(0, y);
          text1b = text1.substring(x);
          text2b = text2.substring(y);
          diffs = this.DiffMain(text1a, text2a, false, deadline);
          diffsb = this.DiffMain(text1b, text2b, false, deadline);
          return diffs.concat(diffsb);
        };
        DiffMatchPatch.prototype.diffCleanupSemantic = function(diffs) {
          var changes, equalities, equalitiesLength, lastequality, pointer, lengthInsertions2, lengthDeletions2, lengthInsertions1, lengthDeletions1, deletion, insertion, overlapLength1, overlapLength2;
          changes = false;
          equalities = [];
          equalitiesLength = 0;
          lastequality = null;
          pointer = 0;
          lengthInsertions1 = 0;
          lengthDeletions1 = 0;
          lengthInsertions2 = 0;
          lengthDeletions2 = 0;
          while (pointer < diffs.length) {
            if (diffs[pointer][0] === DIFF_EQUAL) {
              equalities[equalitiesLength++] = pointer;
              lengthInsertions1 = lengthInsertions2;
              lengthDeletions1 = lengthDeletions2;
              lengthInsertions2 = 0;
              lengthDeletions2 = 0;
              lastequality = diffs[pointer][1];
            } else {
              if (diffs[pointer][0] === DIFF_INSERT) {
                lengthInsertions2 += diffs[pointer][1].length;
              } else {
                lengthDeletions2 += diffs[pointer][1].length;
              }
              if (lastequality && lastequality.length <= Math.max(lengthInsertions1, lengthDeletions1) && lastequality.length <= Math.max(lengthInsertions2, lengthDeletions2)) {
                diffs.splice(equalities[equalitiesLength - 1], 0, [DIFF_DELETE, lastequality]);
                diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
                equalitiesLength--;
                equalitiesLength--;
                pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
                lengthInsertions1 = 0;
                lengthDeletions1 = 0;
                lengthInsertions2 = 0;
                lengthDeletions2 = 0;
                lastequality = null;
                changes = true;
              }
            }
            pointer++;
          }
          if (changes) {
            this.diffCleanupMerge(diffs);
          }
          pointer = 1;
          while (pointer < diffs.length) {
            if (diffs[pointer - 1][0] === DIFF_DELETE && diffs[pointer][0] === DIFF_INSERT) {
              deletion = diffs[pointer - 1][1];
              insertion = diffs[pointer][1];
              overlapLength1 = this.diffCommonOverlap(deletion, insertion);
              overlapLength2 = this.diffCommonOverlap(insertion, deletion);
              if (overlapLength1 >= overlapLength2) {
                if (overlapLength1 >= deletion.length / 2 || overlapLength1 >= insertion.length / 2) {
                  diffs.splice(pointer, 0, [DIFF_EQUAL, insertion.substring(0, overlapLength1)]);
                  diffs[pointer - 1][1] = deletion.substring(0, deletion.length - overlapLength1);
                  diffs[pointer + 1][1] = insertion.substring(overlapLength1);
                  pointer++;
                }
              } else {
                if (overlapLength2 >= deletion.length / 2 || overlapLength2 >= insertion.length / 2) {
                  diffs.splice(pointer, 0, [DIFF_EQUAL, deletion.substring(0, overlapLength2)]);
                  diffs[pointer - 1][0] = DIFF_INSERT;
                  diffs[pointer - 1][1] = insertion.substring(0, insertion.length - overlapLength2);
                  diffs[pointer + 1][0] = DIFF_DELETE;
                  diffs[pointer + 1][1] = deletion.substring(overlapLength2);
                  pointer++;
                }
              }
              pointer++;
            }
            pointer++;
          }
        };
        DiffMatchPatch.prototype.diffCommonOverlap = function(text1, text2) {
          var text1Length, text2Length, textLength, best, length, pattern, found;
          text1Length = text1.length;
          text2Length = text2.length;
          if (text1Length === 0 || text2Length === 0) {
            return 0;
          }
          if (text1Length > text2Length) {
            text1 = text1.substring(text1Length - text2Length);
          } else if (text1Length < text2Length) {
            text2 = text2.substring(0, text1Length);
          }
          textLength = Math.min(text1Length, text2Length);
          if (text1 === text2) {
            return textLength;
          }
          best = 0;
          length = 1;
          while (true) {
            pattern = text1.substring(textLength - length);
            found = text2.indexOf(pattern);
            if (found === -1) {
              return best;
            }
            length += found;
            if (found === 0 || text1.substring(textLength - length) === text2.substring(0, length)) {
              best = length;
              length++;
            }
          }
        };
        DiffMatchPatch.prototype.diffLinesToChars = function(text1, text2) {
          var lineArray, lineHash, chars1, chars2;
          lineArray = [];
          lineHash = {};
          lineArray[0] = "";
          function diffLinesToCharsMunge(text) {
            var chars, lineStart, lineEnd, lineArrayLength, line;
            chars = "";
            lineStart = 0;
            lineEnd = -1;
            lineArrayLength = lineArray.length;
            while (lineEnd < text.length - 1) {
              lineEnd = text.indexOf("\n", lineStart);
              if (lineEnd === -1) {
                lineEnd = text.length - 1;
              }
              line = text.substring(lineStart, lineEnd + 1);
              lineStart = lineEnd + 1;
              if (hasOwn2.call(lineHash, line)) {
                chars += String.fromCharCode(lineHash[line]);
              } else {
                chars += String.fromCharCode(lineArrayLength);
                lineHash[line] = lineArrayLength;
                lineArray[lineArrayLength++] = line;
              }
            }
            return chars;
          }
          chars1 = diffLinesToCharsMunge(text1);
          chars2 = diffLinesToCharsMunge(text2);
          return {
            chars1,
            chars2,
            lineArray
          };
        };
        DiffMatchPatch.prototype.diffCharsToLines = function(diffs, lineArray) {
          var x, chars, text, y;
          for (x = 0; x < diffs.length; x++) {
            chars = diffs[x][1];
            text = [];
            for (y = 0; y < chars.length; y++) {
              text[y] = lineArray[chars.charCodeAt(y)];
            }
            diffs[x][1] = text.join("");
          }
        };
        DiffMatchPatch.prototype.diffCleanupMerge = function(diffs) {
          var pointer, countDelete, countInsert, textInsert, textDelete, commonlength, changes, diffPointer, position;
          diffs.push([DIFF_EQUAL, ""]);
          pointer = 0;
          countDelete = 0;
          countInsert = 0;
          textDelete = "";
          textInsert = "";
          while (pointer < diffs.length) {
            switch (diffs[pointer][0]) {
              case DIFF_INSERT:
                countInsert++;
                textInsert += diffs[pointer][1];
                pointer++;
                break;
              case DIFF_DELETE:
                countDelete++;
                textDelete += diffs[pointer][1];
                pointer++;
                break;
              case DIFF_EQUAL:
                if (countDelete + countInsert > 1) {
                  if (countDelete !== 0 && countInsert !== 0) {
                    commonlength = this.diffCommonPrefix(textInsert, textDelete);
                    if (commonlength !== 0) {
                      if (pointer - countDelete - countInsert > 0 && diffs[pointer - countDelete - countInsert - 1][0] === DIFF_EQUAL) {
                        diffs[pointer - countDelete - countInsert - 1][1] += textInsert.substring(0, commonlength);
                      } else {
                        diffs.splice(0, 0, [DIFF_EQUAL, textInsert.substring(0, commonlength)]);
                        pointer++;
                      }
                      textInsert = textInsert.substring(commonlength);
                      textDelete = textDelete.substring(commonlength);
                    }
                    commonlength = this.diffCommonSuffix(textInsert, textDelete);
                    if (commonlength !== 0) {
                      diffs[pointer][1] = textInsert.substring(textInsert.length - commonlength) + diffs[pointer][1];
                      textInsert = textInsert.substring(0, textInsert.length - commonlength);
                      textDelete = textDelete.substring(0, textDelete.length - commonlength);
                    }
                  }
                  if (countDelete === 0) {
                    diffs.splice(pointer - countInsert, countDelete + countInsert, [DIFF_INSERT, textInsert]);
                  } else if (countInsert === 0) {
                    diffs.splice(pointer - countDelete, countDelete + countInsert, [DIFF_DELETE, textDelete]);
                  } else {
                    diffs.splice(pointer - countDelete - countInsert, countDelete + countInsert, [DIFF_DELETE, textDelete], [DIFF_INSERT, textInsert]);
                  }
                  pointer = pointer - countDelete - countInsert + (countDelete ? 1 : 0) + (countInsert ? 1 : 0) + 1;
                } else if (pointer !== 0 && diffs[pointer - 1][0] === DIFF_EQUAL) {
                  diffs[pointer - 1][1] += diffs[pointer][1];
                  diffs.splice(pointer, 1);
                } else {
                  pointer++;
                }
                countInsert = 0;
                countDelete = 0;
                textDelete = "";
                textInsert = "";
                break;
            }
          }
          if (diffs[diffs.length - 1][1] === "") {
            diffs.pop();
          }
          changes = false;
          pointer = 1;
          while (pointer < diffs.length - 1) {
            if (diffs[pointer - 1][0] === DIFF_EQUAL && diffs[pointer + 1][0] === DIFF_EQUAL) {
              diffPointer = diffs[pointer][1];
              position = diffPointer.substring(diffPointer.length - diffs[pointer - 1][1].length);
              if (position === diffs[pointer - 1][1]) {
                diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
                diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
                diffs.splice(pointer - 1, 1);
                changes = true;
              } else if (diffPointer.substring(0, diffs[pointer + 1][1].length) === diffs[pointer + 1][1]) {
                diffs[pointer - 1][1] += diffs[pointer + 1][1];
                diffs[pointer][1] = diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];
                diffs.splice(pointer + 1, 1);
                changes = true;
              }
            }
            pointer++;
          }
          if (changes) {
            this.diffCleanupMerge(diffs);
          }
        };
        return function(o, n) {
          var diff3, output, text;
          diff3 = new DiffMatchPatch();
          output = diff3.DiffMain(o, n);
          diff3.diffCleanupEfficiency(output);
          text = diff3.diffPrettyHtml(output);
          return text;
        };
      }();
    })();
  });

  // ../../index.js
  var import_qunit = __toModule(require_qunit());
  import_qunit.default.config.autostart = false;
  var isLocal = import_qunit.default.isLocal;
  var on = import_qunit.default.on;
  var test = import_qunit.default.test;
  var skip = import_qunit.default.skip;
  var start = import_qunit.default.start;
  var is = import_qunit.default.is;
  var extend = import_qunit.default.extend;
  var stack = import_qunit.default.stack;
  var onUnhandledRejection = import_qunit.default.onUnhandledRejection;
  var assert = import_qunit.default.assert;
  var dump = import_qunit.default.dump;
  var done = import_qunit.default.done;
  var testStart = import_qunit.default.testStart;
  var moduleStart = import_qunit.default.moduleStart;
  var version = import_qunit.default.version;
  var module = import_qunit.default.module;
  var todo = import_qunit.default.todo;
  var only = import_qunit.default.only;
  var config = import_qunit.default.config;
  var objectType = import_qunit.default.objectType;
  var load = import_qunit.default.load;
  var onError = import_qunit.default.onError;
  var pushFailure = import_qunit.default.pushFailure;
  var equiv = import_qunit.default.equiv;
  var begin = import_qunit.default.begin;
  var log = import_qunit.default.log;
  var testDone = import_qunit.default.testDone;
  var moduleDone = import_qunit.default.moduleDone;
  var diff = import_qunit.default.diff;
  var qunitx_default = Object.assign(import_qunit.default, {
    QUnitxVersion: "0.0.1"
  });

  // passing-tests.js
  module("{{moduleName}}", function(hooks) {
    test("assert true works", function(assert2) {
      assert2.expect(3);
      assert2.ok(true);
      console.log("calling assert true test case");
      assert2.equal(true, true);
      assert2.equal(null, null);
    });
    test("async test finishes", async function(assert2) {
      assert2.expect(3);
      const wait = new Promise((resolve, reject) => {
        window.setTimeout(() => {
          console.log("resolving async test");
          console.log({
            moduleName: "called resolved async test with object",
            placeholder: 1e3,
            anotherObject: {
              firstName: "Izel",
              createdAt: new Date("2021-03-06")
            }
          });
          resolve(true);
        }, 50);
      });
      const result = await wait;
      assert2.ok(true);
      assert2.equal(true, result);
      assert2.equal(null, null);
      result;
    });
    test("deepEqual true works", function(assert2) {
      const me = {firstName: "Izel", lastName: "Nakri"};
      console.log("calling deepEqual test case");
      assert2.deepEqual(me, {firstName: "Izel", lastName: "Nakri"});
    });
  });
})();
