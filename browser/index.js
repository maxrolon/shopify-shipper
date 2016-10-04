(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.srcindex || (g.srcindex = {})).js = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _utils = require('./lib/utils');

var _ajax = require('./lib/ajax');

var _response = require('./lib/response');

exports.default = function (el) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (_typeof(window.Countries) !== 'object') {
    return console.warn('The global Countries object required by your shipping calculator does not exist.');
  }

  var settings = (0, _utils.merge)({
    defaultCountry: null,
    country: '.js-country',
    province: '.js-province',
    zip: '.js-zip',
    success: function success(data) {
      return console.dir(data);
    },
    error: function error(data) {
      return alert(data);
    },
    endpoints: {
      prepare: '/cart/prepare_shipping_rates',
      get: '/cart/async_shipping_rates'
    }
  }, options);

  //Create references to DOM Nodes
  var countrySelect = el.querySelector(settings.country);
  var provinceSelect = el.querySelector(settings.province);
  var zipInput = el.querySelector(settings.zip);

  //Render select options based on Countries JSON and defualt selections
  var selectedCountry = (0, _utils.updateSelectOptions)(countrySelect, Countries, settings.defaultCountry);
  var selectedProvince = (0, _utils.updateSelectOptions)(provinceSelect, (0, _utils.getProvinces)(settings.defaultCountry || Object.keys(Countries)[0]));

  //Lazy getter for form values
  var model = {
    get country() {
      return (0, _utils.findSelect)(countrySelect).value;
    },
    get province() {
      return (0, _utils.findSelect)(provinceSelect).value;
    },
    get zip() {
      return zipInput.value;
    }
  };

  //Respond to the country change event
  //to change state of dependant province selector
  countrySelect.addEventListener('change', function (e) {
    var availableProvinces = (0, _utils.getProvinces)(model.country);

    if (availableProvinces) {
      (0, _utils.updateSelectOptions)(provinceSelect, availableProvinces);
      (0, _utils.enable)(provinceSelect);
    } else {
      provinceSelect.innerHTML = '';
      (0, _utils.disable)(provinceSelect);
    }
  });

  el.addEventListener('submit', function (e) {
    e.preventDefault();
    //IE support
    e.returnValue = false;

    (0, _utils.disable)(el);

    (0, _ajax.requestShippingRates)(settings.endpoints.prepare, model, function (status, data, req) {
      var success = status >= 200 && status <= 300 ? true : false;

      if (success) {
        (0, _ajax.fetchShippingRates)(settings.endpoints.get, function (status, data, req) {
          var response = (0, _response.formatSuccess)(data);
          settings.success(response);
        });
      } else {
        var response = (0, _response.formatError)(data);
        settings.error(response);
      }

      (0, _utils.enable)(el);
    });
  });

  return model;
};

},{"./lib/ajax":3,"./lib/response":4,"./lib/utils":5}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchShippingRates = exports.requestShippingRates = undefined;

var _nanoajax = require('nanoajax');

var _nanoajax2 = _interopRequireDefault(_nanoajax);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var toQueryString = function toQueryString(fields) {
  var data = '';
  var names = Object.keys(fields);

  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    var value = fields[name];
    data += encodeURIComponent('shipping_address[' + name + ']') + '=' + encodeURIComponent(value) + (i < names.length - 1 ? '&' : '');
  }

  return data;
};

var requestShippingRates = exports.requestShippingRates = function requestShippingRates(endpoint, data, cb) {
  return _nanoajax2.default.ajax({
    method: 'post',
    url: endpoint,
    body: toQueryString(data)
  }, cb);
};

var fetchShippingRates = exports.fetchShippingRates = function fetchShippingRates(endpoint, cb) {
  return _nanoajax2.default.ajax({ url: endpoint }, cb);
};

},{"nanoajax":1}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var formatSuccess = exports.formatSuccess = function formatSuccess(data) {
  var parsed = JSON.parse(data);
  var rates = parsed.shipping_rates;

  if (!rates) {
    return;
  }

  var res = [];

  for (var i = 0; i < rates.length; i++) {
    var rate = rates[i];
    res.push({
      type: rate.name,
      price: rate.price
    });
  }

  return res;
};

var formatError = exports.formatError = function formatError(data) {
  var parsed = JSON.parse(data);
  var keys = Object.keys(parsed);

  var res = '';

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    res += 'Error: ' + key + ' ' + parsed[key][0] + (i !== keys.length - 1 ? ', ' : '');
  }

  return res;
};

/**
 * TODO
 * Write a default template to render to DOM
 */

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @return {array} Array of provinces
 */
var getProvinces = exports.getProvinces = function getProvinces(country) {
  return country ? Countries[country].provinces : null;
};

/**
 * Return the element passed, if it's a <select>,
 * otherwise find the <select> within the passed
 * node and return it.
 *
 * @return {element} selecto element
 */
var findSelect = exports.findSelect = function findSelect(o) {
  return o.nodeName.toLowerCase() === 'select' ? o : o.getElementsByTagName('select')[0];
};

/**
 * Status utiltiy functions,
 * for during ajax
 */
var disable = exports.disable = function disable(target) {
  return target.classList.add('is-disabled');
};
var enable = exports.enable = function enable(target) {
  return target.classList.remove('is-disabled');
};

/**
 * Merge two objects into a 
 * new object
 *
 * @param {object} target Root object
 * @param {object} source Object to merge 
 *
 * @return {object} A *new* object with all props of the passed objects
 */
var merge = exports.merge = function merge(target) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  for (var i = 0; i < args.length; i++) {
    var source = args[i];
    for (var key in source) {
      if (source[key]) target[key] = source[key];
    }
  }

  return target;
};

/**
 * Creates and returns an option with 
 * the passed value as both the value 
 * property and the innerHTML property.
 *
 * @param {string} val Label and value of option
 * @return {element} option element
 */
var createOption = function createOption() {
  var val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  var el = document.createElement('option');

  if (!val) {
    return;
  }

  el.value = val;
  el.innerHTML = val;

  return el;
};

/**
 * Select an option within a <select>
 * based on a given value
 *
 * @param {string} value Value to search for
 * @param {element} select <select> element
 * @return {element} The first matching select option
 */
var selectOption = function selectOption(value, select) {
  return Array.prototype.slice.call(select.options).filter(function (option, i) {
    if (option.value === value) {
      select.selectedIndex = i;
      return true;
    }
    return false;
  })[0];
};

/**
 * Generate select options for a given select element
 *
 * @param {array} options Array of options 
 * @return {string} the selected value of the target select element
 */
var updateSelectOptions = exports.updateSelectOptions = function updateSelectOptions(select, options) {
  var selectedOption = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  var target = findSelect(select);
  var prev = target.options[0] ? target.options[0].value : false;

  options = Array.isArray(options) ? options : Object.keys(options);

  var shouldUpdate = !prev || options[0] !== prev ? true : false;

  if (shouldUpdate) {
    target.innerHTML = '';
    options.forEach(function (o) {
      return target.appendChild(createOption(o));
    });
  }

  if (selectedOption) {
    selectOption(selectedOption, target);
  }

  return target.value;
};

},{}]},{},[2])(2)
});