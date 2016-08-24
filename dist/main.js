(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
// Best place to find information on XHR features is:
// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest

var reqfields = [
  'responseType', 'withCredentials', 'timeout', 'onprogress'
]

// Simple and small ajax function
// Takes a parameters object and a callback function
// Parameters:
//  - url: string, required
//  - headers: object of `{header_name: header_value, ...}`
//  - body:
//      + string (sets content type to 'application/x-www-form-urlencoded' if not set in headers)
//      + FormData (doesn't set content type so that browser will set as appropriate)
//  - method: 'GET', 'POST', etc. Defaults to 'GET' or 'POST' based on body
//  - cors: If your using cross-origin, you will need this true for IE8-9
//
// The following parameters are passed onto the xhr object.
// IMPORTANT NOTE: The caller is responsible for compatibility checking.
//  - responseType: string, various compatability, see xhr docs for enum options
//  - withCredentials: boolean, IE10+, CORS only
//  - timeout: long, ms timeout, IE8+
//  - onprogress: callback, IE10+
//
// Callback function prototype:
//  - statusCode from request
//  - response
//    + if responseType set and supported by browser, this is an object of some type (see docs)
//    + otherwise if request completed, this is the string text of the response
//    + if request is aborted, this is "Abort"
//    + if request times out, this is "Timeout"
//    + if request errors before completing (probably a CORS issue), this is "Error"
//  - request object
//
// Returns the request object. So you can call .abort() or other methods
//
// DEPRECATIONS:
//  - Passing a string instead of the params object has been removed!
//
exports.ajax = function (params, callback) {
  // Any variable used more than once is var'd here because
  // minification will munge the variables whereas it can't munge
  // the object access.
  var headers = params.headers || {}
    , body = params.body
    , method = params.method || (body ? 'POST' : 'GET')
    , called = false

  var req = getRequest(params.cors)

  function cb(statusCode, responseText) {
    return function () {
      if (!called) {
        callback(req.status === undefined ? statusCode : req.status,
                 req.status === 0 ? "Error" : (req.response || req.responseText || responseText),
                 req)
        called = true
      }
    }
  }

  req.open(method, params.url, true)

  var success = req.onload = cb(200)
  req.onreadystatechange = function () {
    if (req.readyState === 4) success()
  }
  req.onerror = cb(null, 'Error')
  req.ontimeout = cb(null, 'Timeout')
  req.onabort = cb(null, 'Abort')

  if (body) {
    setDefault(headers, 'X-Requested-With', 'XMLHttpRequest')

    if (!global.FormData || !(body instanceof global.FormData)) {
      setDefault(headers, 'Content-Type', 'application/x-www-form-urlencoded')
    }
  }

  for (var i = 0, len = reqfields.length, field; i < len; i++) {
    field = reqfields[i]
    if (params[field] !== undefined)
      req[field] = params[field]
  }

  for (var field in headers)
    req.setRequestHeader(field, headers[field])

  req.send(body)

  return req
}

function getRequest(cors) {
  // XDomainRequest is only way to do CORS in IE 8 and 9
  // But XDomainRequest isn't standards-compatible
  // Notably, it doesn't allow cookies to be sent or set by servers
  // IE 10+ is standards-compatible in its XMLHttpRequest
  // but IE 10 can still have an XDomainRequest object, so we don't want to use it
  if (cors && global.XDomainRequest && !/MSIE 1/.test(navigator.userAgent))
    return new XDomainRequest
  if (global.XMLHttpRequest)
    return new XMLHttpRequest
}

function setDefault(obj, key, value) {
  obj[key] = obj[key] || value
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utils = require('./../lib/utils.js');

exports.default = function () {

	return {
		make: function make(name) {
			var existing = (0, _utils.selectNodes)('[name="' + name + '"]', this._context);
			if (existing) return existing;
			var select = (0, _utils.createNode)('select', { name: name });
			this._context.appendChild(select);
			return select;
		},
		context: function context(el) {
			this._context = el;
			return this;
		},
		update: function update(el) {
			var options = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

			var values = void 0,
			    option = void 0;

			if (typeof options != 'string') {
				values = Object.keys(options);
			} else {
				values = Countries[options].provinces || false;
			}

			el.innerHTML = '';
			el.value = '';

			if (values) {
				el.style.visibility = 'visible';
			} else {
				el.style.visibility = 'hidden';
				return;
			}
			for (var i = 0; i < values.length; i++) {
				var value = values[i];
				option = (0, _utils.createNode)('option', { value: value });
				option.innerHTML = value;
				el.add(option);
			}
		}
	};
};

},{"./../lib/utils.js":8}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _mock = require('./mock');

var _mock2 = _interopRequireDefault(_mock);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var nanoajax = require('nanoajax');

var data = void 0;
var endCb = void 0;

function toQueryString(obj) {
	var str = '';
	for (var key in obj) {
		str += key + '=' + obj[key] + '&';
	}
	return str.slice(0, -1);
}

function prepare() {
	nanoajax.ajax({ url: _mock2.default.prepare, body: toQueryString(data), method: "post" }, get);
}

function get() {
	nanoajax.ajax({ url: _mock2.default.get }, endCb);
}

exports.default = function (inputs, cb) {
	data = inputs;
	endCb = cb;
	prepare();
};

},{"./mock":5,"nanoajax":1}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {

	return {
		isLocked: false,
		register: function register() {
			for (var _len = arguments.length, els = Array(_len), _key = 0; _key < _len; _key++) {
				els[_key] = arguments[_key];
			}

			this.els = els;
		},
		lock: function lock() {
			for (var i = 0; i < this.els.length; i++) {
				this.els[i].disabled = true;
			}
			this.isLocked = true;
		},
		unLock: function unLock() {
			for (var i = 0; i < this.els.length; i++) {
				this.els[i].disabled = false;
			}
			this.isLocked = false;
		}
	};
};

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  prepare: 'http://demo7063601.mockable.io/prepare',
  get: 'http://demo7063601.mockable.io/get-shipping-rates'
};

},{}],6:[function(require,module,exports){
'use strict';

/**
 * Object.assign fallback
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 */
if ('function' != typeof Object.assign) {
  Object.assign = function (target) {
    'use strict';

    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    target = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source != null) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }

    return target;
  };
}

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (data, modelData) {
	var el = (0, _utils.selectNodes)('[data-type="result"]', this);
	data = JSON.parse(data);

	if (!data['shipping_rates']) return;
	var rates = data['shipping_rates'];
	var string = '';

	for (var i = 0; i < rates.length; i++) {
		string += rates[i].name + ": " + rates[i].price + "\r\n";
	}

	el.innerHTML = string;
};

var _utils = require('./utils');

},{"./utils":8}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.selectNodes = selectNodes;
exports.createNode = createNode;
exports.addProps = addProps;
exports.addEvent = addEvent;
function nodeArray(nodeList) {
	return [].slice.call(nodeList);
}

function selectNodes(string) {
	var el = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

	var nodes = (el || document).querySelectorAll(string);
	if (!nodes.length) return false;
	var nodesArray = nodeArray(nodes);
	if (nodesArray.length == 1) return nodesArray[0];
	return nodesArray;
}

function createNode(name, attrs) {
	var el = document.createElement(name.toString());

	!!attrs && Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});

	return el;
}

function addProps() {
	var isNode = prop.nodeType ? true : false;
	var isNumber = 'number' === typeof prop ? true : false;

	var key = isNumber || isNode ? 'range' : 'options';

	if (isNode || isNumber) {
		Object.defineProperty(target, key, {
			value: prop,
			writable: true
		});
	} else if (!isNode) {
		_extends(target.options, prop);
	}
}

function addEvent(obj, type, fn) {
	if (obj.attachEvent) {
		obj['e' + type + fn] = fn;
		obj[type + fn] = function () {
			obj['e' + type + fn](window.event);
		};
		obj.attachEvent('on' + type, obj[type + fn]);
	} else obj.addEventListener(type, fn, false);
}

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

require('./lib/polyfills');

var _utils = require('./lib/utils');

var _ajax = require('./lib/ajax');

var _ajax2 = _interopRequireDefault(_ajax);

var _response = require('./lib/response');

var _response2 = _interopRequireDefault(_response);

var _lock = require('./lib/lock');

var _lock2 = _interopRequireDefault(_lock);

var _Select = require('./lib/Select');

var _Select2 = _interopRequireDefault(_Select);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (el) {
	var args = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	var instance = void 0;

	var settings = {
		endpoints: ['/cart/prepare_shipping_rates', '/cart/async_shipping_rates'],
		selectContainer: '[data-type="select-container"]',
		responseCb: _response2.default,
		defaultCountry: "United States"
	};
	_extends(settings, args);

	var selectWrap = (0, _utils.selectNodes)(settings.selectContainer, el);

	var select = (0, _Select2.default)().context(selectWrap);
	var country = select.make('country');
	var province = select.make('province');
	var model = {
		isLocked: false,
		data: {}
	};

	(0, _utils.addEvent)(country, 'change', function (e) {
		model.country = e.target.value;
	});

	(0, _utils.addEvent)(province, 'change', function (e) {
		model.province = e.target.value;
	});

	select.update(country, Countries);

	function makeDescriptor(prop) {
		return {
			get: function get() {
				return this.data[prop];
			},
			set: function set(val) {
				this.data[prop] = val;
			}
		};
	}

	Object.defineProperty(model, 'country', {
		get: function get() {
			return this.data.country;
		},
		set: function set(val) {
			this.data.country = val;
			country.value = val;
			select.update(province, val);
			this.province = province.value;
		}
	});

	Object.defineProperty(model, 'province', makeDescriptor('province'));
	Object.defineProperty(model, 'zip', makeDescriptor('zip'));

	var zip = (0, _utils.selectNodes)('[name="zip"]', el);

	(0, _utils.addEvent)(zip, 'blur', function (e) {
		model.zip = zip.value;
	});

	var lock = (0, _lock2.default)();
	lock.register(country, province, zip);

	//Handle the submission of the form
	(0, _utils.addEvent)(el, 'submit', function (e) {
		e.preventDefault();

		if (lock.isLocked) return false;
		lock.lock();

		(0, _ajax2.default)(model.data, function (code, data) {
			lock.unLock();
			settings.responseCb.call(el, data, model.data);
		});
	});

	model.country = settings.defaultCountry;

	return instance;
};

},{"./lib/Select":2,"./lib/ajax":3,"./lib/lock":4,"./lib/polyfills":6,"./lib/response":7,"./lib/utils":8}]},{},[9]);
