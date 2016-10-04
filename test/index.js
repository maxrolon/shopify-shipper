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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _utils = require('./lib/utils');

var _ajax = require('./lib/ajax');

var _response = require('./lib/response');

exports.default = function (el) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (_typeof(window.Countries) !== 'object') {
    return console.warn('The global Countries object required by your shipping calculator does not exist.');
  }

  console.dir(el);
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

},{}],6:[function(require,module,exports){
"use strict";

var _utils = require("./../src/lib/utils");

var _index = require("./../src/index");

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.addEventListener("DOMContentLoaded", function () {
  var el = document.querySelector('[data-init="shipping-calculator"]');
  (0, _index2.default)(el, {
    endpoints: {
      prepare: 'http://demo7063601.mockable.io/prepare',
      get: 'http://demo7063601.mockable.io/get-shipping-rates'
    },
    defaultCountry: "Canada"
  });
});

},{"./../src/index":2,"./../src/lib/utils":5}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibm9kZV9tb2R1bGVzL25hbm9hamF4L2luZGV4LmpzIiwic3JjL2luZGV4LmpzIiwic3JjL2xpYi9hamF4LmpzIiwic3JjL2xpYi9yZXNwb25zZS5qcyIsInNyYy9saWIvdXRpbHMuanMiLCJ0ZXN0L2Rldi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUM3R0E7O0FBQ0E7O0FBQ0E7O2tCQUVlLFVBQUMsRUFBRCxFQUFzQjtBQUFBLE1BQWpCLE9BQWlCLHVFQUFQLEVBQU87O0FBQ25DLE1BQUksUUFBTyxPQUFPLFNBQWQsTUFBNEIsUUFBaEMsRUFBeUM7QUFBRSxXQUFPLFFBQVEsSUFBUixDQUFhLGtGQUFiLENBQVA7QUFBeUc7O0FBRXRKLFVBQVEsR0FBUixDQUFZLEVBQVo7QUFDRSxNQUFNLFdBQVcsa0JBQU07QUFDckIsb0JBQWdCLElBREs7QUFFckIsYUFBUyxhQUZZO0FBR3JCLGNBQVUsY0FIVztBQUlyQixTQUFLLFNBSmdCO0FBS3JCLGFBQVMsaUJBQUMsSUFBRDtBQUFBLGFBQVUsUUFBUSxHQUFSLENBQVksSUFBWixDQUFWO0FBQUEsS0FMWTtBQU1yQixXQUFPLGVBQUMsSUFBRDtBQUFBLGFBQVUsTUFBTSxJQUFOLENBQVY7QUFBQSxLQU5jO0FBT3JCLGVBQVc7QUFDVCxlQUFTLDhCQURBO0FBRVQsV0FBSztBQUZJO0FBUFUsR0FBTixFQVdkLE9BWGMsQ0FBakI7O0FBYUE7QUFDQSxNQUFNLGdCQUFnQixHQUFHLGFBQUgsQ0FBaUIsU0FBUyxPQUExQixDQUF0QjtBQUNBLE1BQU0saUJBQWlCLEdBQUcsYUFBSCxDQUFpQixTQUFTLFFBQTFCLENBQXZCO0FBQ0EsTUFBTSxXQUFXLEdBQUcsYUFBSCxDQUFpQixTQUFTLEdBQTFCLENBQWpCOztBQUVBO0FBQ0EsTUFBTSxrQkFBa0IsZ0NBQW9CLGFBQXBCLEVBQW1DLFNBQW5DLEVBQThDLFNBQVMsY0FBdkQsQ0FBeEI7QUFDQSxNQUFNLG1CQUFtQixnQ0FBb0IsY0FBcEIsRUFBb0MseUJBQWEsU0FBUyxjQUFULElBQTJCLE9BQU8sSUFBUCxDQUFZLFNBQVosRUFBdUIsQ0FBdkIsQ0FBeEMsQ0FBcEMsQ0FBekI7O0FBRUE7QUFDQSxNQUFNLFFBQVE7QUFDWixRQUFJLE9BQUosR0FBYTtBQUNYLGFBQU8sdUJBQVcsYUFBWCxFQUEwQixLQUFqQztBQUNELEtBSFc7QUFJWixRQUFJLFFBQUosR0FBYztBQUNaLGFBQU8sdUJBQVcsY0FBWCxFQUEyQixLQUFsQztBQUNELEtBTlc7QUFPWixRQUFJLEdBQUosR0FBUztBQUNQLGFBQU8sU0FBUyxLQUFoQjtBQUNEO0FBVFcsR0FBZDs7QUFZQTtBQUNBO0FBQ0EsZ0JBQWMsZ0JBQWQsQ0FBK0IsUUFBL0IsRUFBeUMsVUFBQyxDQUFELEVBQU87QUFDOUMsUUFBSSxxQkFBcUIseUJBQWEsTUFBTSxPQUFuQixDQUF6Qjs7QUFFQSxRQUFJLGtCQUFKLEVBQXVCO0FBQ3JCLHNDQUFvQixjQUFwQixFQUFvQyxrQkFBcEM7QUFDQSx5QkFBTyxjQUFQO0FBQ0QsS0FIRCxNQUdPO0FBQ0wscUJBQWUsU0FBZixHQUEyQixFQUEzQjtBQUNBLDBCQUFRLGNBQVI7QUFDRDtBQUNGLEdBVkQ7O0FBWUEsS0FBRyxnQkFBSCxDQUFvQixRQUFwQixFQUE4QixVQUFDLENBQUQsRUFBTztBQUNuQyxNQUFFLGNBQUY7QUFDQTtBQUNBLE1BQUUsV0FBRixHQUFnQixLQUFoQjs7QUFFQSx3QkFBUSxFQUFSOztBQUVBLG9DQUFxQixTQUFTLFNBQVQsQ0FBbUIsT0FBeEMsRUFBaUQsS0FBakQsRUFBd0QsVUFBQyxNQUFELEVBQVMsSUFBVCxFQUFlLEdBQWYsRUFBdUI7QUFDN0UsVUFBSSxVQUFVLFVBQVUsR0FBVixJQUFpQixVQUFVLEdBQTNCLEdBQWlDLElBQWpDLEdBQXdDLEtBQXREOztBQUVBLFVBQUksT0FBSixFQUFZO0FBQ1Ysc0NBQW1CLFNBQVMsU0FBVCxDQUFtQixHQUF0QyxFQUEyQyxVQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsR0FBZixFQUF1QjtBQUNoRSxjQUFJLFdBQVcsNkJBQWMsSUFBZCxDQUFmO0FBQ0EsbUJBQVMsT0FBVCxDQUFpQixRQUFqQjtBQUNELFNBSEQ7QUFJRCxPQUxELE1BS087QUFDTCxZQUFJLFdBQVcsMkJBQVksSUFBWixDQUFmO0FBQ0EsaUJBQVMsS0FBVCxDQUFlLFFBQWY7QUFDRDs7QUFFRCx5QkFBTyxFQUFQO0FBQ0QsS0FkRDtBQWdCRCxHQXZCRDs7QUF5QkEsU0FBTyxLQUFQO0FBQ0QsQzs7Ozs7Ozs7OztBQ25GRDs7Ozs7O0FBRUEsSUFBTSxnQkFBZ0IsU0FBaEIsYUFBZ0IsQ0FBQyxNQUFELEVBQVk7QUFDaEMsTUFBSSxPQUFPLEVBQVg7QUFDQSxNQUFJLFFBQVEsT0FBTyxJQUFQLENBQVksTUFBWixDQUFaOztBQUVBLE9BQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxNQUFNLE1BQTFCLEVBQWtDLEdBQWxDLEVBQXNDO0FBQ3BDLFFBQUksT0FBTyxNQUFNLENBQU4sQ0FBWDtBQUNBLFFBQUksUUFBUSxPQUFPLElBQVAsQ0FBWjtBQUNBLFlBQVcseUNBQXVDLElBQXZDLE9BQVgsU0FBOEQsbUJBQW1CLEtBQW5CLENBQTlELElBQTBGLElBQUksTUFBTSxNQUFOLEdBQWMsQ0FBbEIsR0FBc0IsR0FBdEIsR0FBNEIsRUFBdEg7QUFDRDs7QUFFRCxTQUFPLElBQVA7QUFDRCxDQVhEOztBQWFPLElBQU0sc0RBQXVCLFNBQXZCLG9CQUF1QixDQUFDLFFBQUQsRUFBVyxJQUFYLEVBQWlCLEVBQWpCO0FBQUEsU0FBd0IsbUJBQVMsSUFBVCxDQUFjO0FBQ3hFLFlBQVEsTUFEZ0U7QUFFeEUsU0FBSyxRQUZtRTtBQUd4RSxVQUFNLGNBQWMsSUFBZDtBQUhrRSxHQUFkLEVBSXpELEVBSnlELENBQXhCO0FBQUEsQ0FBN0I7O0FBTUEsSUFBTSxrREFBcUIsU0FBckIsa0JBQXFCLENBQUMsUUFBRCxFQUFXLEVBQVg7QUFBQSxTQUFrQixtQkFBUyxJQUFULENBQWMsRUFBRSxLQUFLLFFBQVAsRUFBZCxFQUFpQyxFQUFqQyxDQUFsQjtBQUFBLENBQTNCOzs7Ozs7OztBQ3JCQSxJQUFNLHdDQUFnQixTQUFoQixhQUFnQixDQUFDLElBQUQsRUFBVTtBQUNyQyxNQUFNLFNBQVMsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFmO0FBQ0EsTUFBTSxRQUFRLE9BQU8sY0FBckI7O0FBRUEsTUFBSSxDQUFDLEtBQUwsRUFBVztBQUFFO0FBQVE7O0FBRXJCLE1BQU0sTUFBTSxFQUFaOztBQUVBLE9BQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxNQUFNLE1BQTFCLEVBQWtDLEdBQWxDLEVBQXNDO0FBQ3BDLFFBQUksT0FBTyxNQUFNLENBQU4sQ0FBWDtBQUNBLFFBQUksSUFBSixDQUFTO0FBQ1AsWUFBTSxLQUFLLElBREo7QUFFUCxhQUFPLEtBQUs7QUFGTCxLQUFUO0FBSUQ7O0FBRUQsU0FBTyxHQUFQO0FBQ0QsQ0FqQk07O0FBbUJBLElBQU0sb0NBQWMsU0FBZCxXQUFjLENBQUMsSUFBRCxFQUFVO0FBQ25DLE1BQU0sU0FBUyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWY7QUFDQSxNQUFNLE9BQU8sT0FBTyxJQUFQLENBQVksTUFBWixDQUFiOztBQUVBLE1BQUksTUFBTSxFQUFWOztBQUVBLE9BQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxLQUFLLE1BQXpCLEVBQWlDLEdBQWpDLEVBQXFDO0FBQ25DLFFBQUksTUFBTSxLQUFLLENBQUwsQ0FBVjtBQUNBLHVCQUFpQixHQUFqQixTQUF3QixPQUFPLEdBQVAsRUFBWSxDQUFaLENBQXhCLElBQXlDLE1BQU0sS0FBSyxNQUFMLEdBQWMsQ0FBcEIsR0FBd0IsSUFBeEIsR0FBK0IsRUFBeEU7QUFDRDs7QUFFRCxTQUFPLEdBQVA7QUFDRCxDQVpNOztBQWNQOzs7Ozs7Ozs7OztBQ2pDQTs7O0FBR08sSUFBTSxzQ0FBZSxTQUFmLFlBQWU7QUFBQSxTQUFXLFVBQVUsVUFBVSxPQUFWLEVBQW1CLFNBQTdCLEdBQXlDLElBQXBEO0FBQUEsQ0FBckI7O0FBRVA7Ozs7Ozs7QUFPTyxJQUFNLGtDQUFhLFNBQWIsVUFBYTtBQUFBLFNBQUssRUFBRSxRQUFGLENBQVcsV0FBWCxPQUE2QixRQUE3QixHQUF3QyxDQUF4QyxHQUE0QyxFQUFFLG9CQUFGLENBQXVCLFFBQXZCLEVBQWlDLENBQWpDLENBQWpEO0FBQUEsQ0FBbkI7O0FBRVA7Ozs7QUFJTyxJQUFNLDRCQUFVLFNBQVYsT0FBVTtBQUFBLFNBQVUsT0FBTyxTQUFQLENBQWlCLEdBQWpCLENBQXFCLGFBQXJCLENBQVY7QUFBQSxDQUFoQjtBQUNBLElBQU0sMEJBQVMsU0FBVCxNQUFTO0FBQUEsU0FBVSxPQUFPLFNBQVAsQ0FBaUIsTUFBakIsQ0FBd0IsYUFBeEIsQ0FBVjtBQUFBLENBQWY7O0FBRVA7Ozs7Ozs7OztBQVNPLElBQU0sd0JBQVEsU0FBUixLQUFRLENBQUMsTUFBRCxFQUFxQjtBQUFBLG9DQUFULElBQVM7QUFBVCxRQUFTO0FBQUE7O0FBQ3hDLE9BQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxLQUFLLE1BQXpCLEVBQWlDLEdBQWpDLEVBQXFDO0FBQ25DLFFBQUksU0FBUyxLQUFLLENBQUwsQ0FBYjtBQUNBLFNBQUssSUFBSSxHQUFULElBQWdCLE1BQWhCLEVBQXVCO0FBQ3JCLFVBQUksT0FBTyxHQUFQLENBQUosRUFBaUIsT0FBTyxHQUFQLElBQWMsT0FBTyxHQUFQLENBQWQ7QUFDbEI7QUFDRjs7QUFFRCxTQUFPLE1BQVA7QUFDRCxDQVRNOztBQVdQOzs7Ozs7OztBQVFBLElBQU0sZUFBZSxTQUFmLFlBQWUsR0FBZ0I7QUFBQSxNQUFmLEdBQWUsdUVBQVQsSUFBUzs7QUFDbkMsTUFBSSxLQUFLLFNBQVMsYUFBVCxDQUF1QixRQUF2QixDQUFUOztBQUVBLE1BQUksQ0FBQyxHQUFMLEVBQVM7QUFBRTtBQUFROztBQUVuQixLQUFHLEtBQUgsR0FBVyxHQUFYO0FBQ0EsS0FBRyxTQUFILEdBQWUsR0FBZjs7QUFFQSxTQUFPLEVBQVA7QUFDRCxDQVREOztBQVdBOzs7Ozs7OztBQVFBLElBQU0sZUFBZSxTQUFmLFlBQWUsQ0FBQyxLQUFELEVBQVEsTUFBUjtBQUFBLFNBQW1CLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixJQUF0QixDQUEyQixPQUFPLE9BQWxDLEVBQTJDLE1BQTNDLENBQWtELFVBQVMsTUFBVCxFQUFpQixDQUFqQixFQUFtQjtBQUMzRyxRQUFJLE9BQU8sS0FBUCxLQUFpQixLQUFyQixFQUEyQjtBQUN6QixhQUFPLGFBQVAsR0FBdUIsQ0FBdkI7QUFDQSxhQUFPLElBQVA7QUFDRDtBQUNELFdBQU8sS0FBUDtBQUNELEdBTnVDLEVBTXJDLENBTnFDLENBQW5CO0FBQUEsQ0FBckI7O0FBUUE7Ozs7OztBQU1PLElBQU0sb0RBQXNCLFNBQXRCLG1CQUFzQixDQUFDLE1BQUQsRUFBUyxPQUFULEVBQTRDO0FBQUEsTUFBMUIsY0FBMEIsdUVBQVQsSUFBUzs7QUFDN0UsTUFBTSxTQUFTLFdBQVcsTUFBWCxDQUFmO0FBQ0EsTUFBTSxPQUFPLE9BQU8sT0FBUCxDQUFlLENBQWYsSUFBb0IsT0FBTyxPQUFQLENBQWUsQ0FBZixFQUFrQixLQUF0QyxHQUE4QyxLQUEzRDs7QUFFQSxZQUFVLE1BQU0sT0FBTixDQUFjLE9BQWQsSUFBeUIsT0FBekIsR0FBbUMsT0FBTyxJQUFQLENBQVksT0FBWixDQUE3Qzs7QUFFQSxNQUFNLGVBQWUsQ0FBQyxJQUFELElBQVMsUUFBUSxDQUFSLE1BQWUsSUFBeEIsR0FBK0IsSUFBL0IsR0FBc0MsS0FBM0Q7O0FBRUEsTUFBSSxZQUFKLEVBQWlCO0FBQ2YsV0FBTyxTQUFQLEdBQW1CLEVBQW5CO0FBQ0EsWUFBUSxPQUFSLENBQWdCO0FBQUEsYUFBSyxPQUFPLFdBQVAsQ0FBbUIsYUFBYSxDQUFiLENBQW5CLENBQUw7QUFBQSxLQUFoQjtBQUNEOztBQUVELE1BQUksY0FBSixFQUFtQjtBQUFFLGlCQUFhLGNBQWIsRUFBNkIsTUFBN0I7QUFBc0M7O0FBRTNELFNBQU8sT0FBTyxLQUFkO0FBQ0QsQ0FoQk07Ozs7O0FDbEZQOztBQUNBOzs7Ozs7QUFFQSxTQUFTLGdCQUFULENBQTBCLGtCQUExQixFQUE4QyxZQUFVO0FBQ3RELE1BQUksS0FBSyxTQUFTLGFBQVQsQ0FBdUIsbUNBQXZCLENBQVQ7QUFDQSx1QkFBVSxFQUFWLEVBQWM7QUFDWixlQUFVO0FBQ1IsZUFBUSx3Q0FEQTtBQUVSLFdBQUk7QUFGSSxLQURFO0FBS1osb0JBQWU7QUFMSCxHQUFkO0FBT0QsQ0FURCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBCZXN0IHBsYWNlIHRvIGZpbmQgaW5mb3JtYXRpb24gb24gWEhSIGZlYXR1cmVzIGlzOlxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1hNTEh0dHBSZXF1ZXN0XG5cbnZhciByZXFmaWVsZHMgPSBbXG4gICdyZXNwb25zZVR5cGUnLCAnd2l0aENyZWRlbnRpYWxzJywgJ3RpbWVvdXQnLCAnb25wcm9ncmVzcydcbl1cblxuLy8gU2ltcGxlIGFuZCBzbWFsbCBhamF4IGZ1bmN0aW9uXG4vLyBUYWtlcyBhIHBhcmFtZXRlcnMgb2JqZWN0IGFuZCBhIGNhbGxiYWNrIGZ1bmN0aW9uXG4vLyBQYXJhbWV0ZXJzOlxuLy8gIC0gdXJsOiBzdHJpbmcsIHJlcXVpcmVkXG4vLyAgLSBoZWFkZXJzOiBvYmplY3Qgb2YgYHtoZWFkZXJfbmFtZTogaGVhZGVyX3ZhbHVlLCAuLi59YFxuLy8gIC0gYm9keTpcbi8vICAgICAgKyBzdHJpbmcgKHNldHMgY29udGVudCB0eXBlIHRvICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnIGlmIG5vdCBzZXQgaW4gaGVhZGVycylcbi8vICAgICAgKyBGb3JtRGF0YSAoZG9lc24ndCBzZXQgY29udGVudCB0eXBlIHNvIHRoYXQgYnJvd3NlciB3aWxsIHNldCBhcyBhcHByb3ByaWF0ZSlcbi8vICAtIG1ldGhvZDogJ0dFVCcsICdQT1NUJywgZXRjLiBEZWZhdWx0cyB0byAnR0VUJyBvciAnUE9TVCcgYmFzZWQgb24gYm9keVxuLy8gIC0gY29yczogSWYgeW91ciB1c2luZyBjcm9zcy1vcmlnaW4sIHlvdSB3aWxsIG5lZWQgdGhpcyB0cnVlIGZvciBJRTgtOVxuLy9cbi8vIFRoZSBmb2xsb3dpbmcgcGFyYW1ldGVycyBhcmUgcGFzc2VkIG9udG8gdGhlIHhociBvYmplY3QuXG4vLyBJTVBPUlRBTlQgTk9URTogVGhlIGNhbGxlciBpcyByZXNwb25zaWJsZSBmb3IgY29tcGF0aWJpbGl0eSBjaGVja2luZy5cbi8vICAtIHJlc3BvbnNlVHlwZTogc3RyaW5nLCB2YXJpb3VzIGNvbXBhdGFiaWxpdHksIHNlZSB4aHIgZG9jcyBmb3IgZW51bSBvcHRpb25zXG4vLyAgLSB3aXRoQ3JlZGVudGlhbHM6IGJvb2xlYW4sIElFMTArLCBDT1JTIG9ubHlcbi8vICAtIHRpbWVvdXQ6IGxvbmcsIG1zIHRpbWVvdXQsIElFOCtcbi8vICAtIG9ucHJvZ3Jlc3M6IGNhbGxiYWNrLCBJRTEwK1xuLy9cbi8vIENhbGxiYWNrIGZ1bmN0aW9uIHByb3RvdHlwZTpcbi8vICAtIHN0YXR1c0NvZGUgZnJvbSByZXF1ZXN0XG4vLyAgLSByZXNwb25zZVxuLy8gICAgKyBpZiByZXNwb25zZVR5cGUgc2V0IGFuZCBzdXBwb3J0ZWQgYnkgYnJvd3NlciwgdGhpcyBpcyBhbiBvYmplY3Qgb2Ygc29tZSB0eXBlIChzZWUgZG9jcylcbi8vICAgICsgb3RoZXJ3aXNlIGlmIHJlcXVlc3QgY29tcGxldGVkLCB0aGlzIGlzIHRoZSBzdHJpbmcgdGV4dCBvZiB0aGUgcmVzcG9uc2Vcbi8vICAgICsgaWYgcmVxdWVzdCBpcyBhYm9ydGVkLCB0aGlzIGlzIFwiQWJvcnRcIlxuLy8gICAgKyBpZiByZXF1ZXN0IHRpbWVzIG91dCwgdGhpcyBpcyBcIlRpbWVvdXRcIlxuLy8gICAgKyBpZiByZXF1ZXN0IGVycm9ycyBiZWZvcmUgY29tcGxldGluZyAocHJvYmFibHkgYSBDT1JTIGlzc3VlKSwgdGhpcyBpcyBcIkVycm9yXCJcbi8vICAtIHJlcXVlc3Qgb2JqZWN0XG4vL1xuLy8gUmV0dXJucyB0aGUgcmVxdWVzdCBvYmplY3QuIFNvIHlvdSBjYW4gY2FsbCAuYWJvcnQoKSBvciBvdGhlciBtZXRob2RzXG4vL1xuLy8gREVQUkVDQVRJT05TOlxuLy8gIC0gUGFzc2luZyBhIHN0cmluZyBpbnN0ZWFkIG9mIHRoZSBwYXJhbXMgb2JqZWN0IGhhcyBiZWVuIHJlbW92ZWQhXG4vL1xuZXhwb3J0cy5hamF4ID0gZnVuY3Rpb24gKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgLy8gQW55IHZhcmlhYmxlIHVzZWQgbW9yZSB0aGFuIG9uY2UgaXMgdmFyJ2QgaGVyZSBiZWNhdXNlXG4gIC8vIG1pbmlmaWNhdGlvbiB3aWxsIG11bmdlIHRoZSB2YXJpYWJsZXMgd2hlcmVhcyBpdCBjYW4ndCBtdW5nZVxuICAvLyB0aGUgb2JqZWN0IGFjY2Vzcy5cbiAgdmFyIGhlYWRlcnMgPSBwYXJhbXMuaGVhZGVycyB8fCB7fVxuICAgICwgYm9keSA9IHBhcmFtcy5ib2R5XG4gICAgLCBtZXRob2QgPSBwYXJhbXMubWV0aG9kIHx8IChib2R5ID8gJ1BPU1QnIDogJ0dFVCcpXG4gICAgLCBjYWxsZWQgPSBmYWxzZVxuXG4gIHZhciByZXEgPSBnZXRSZXF1ZXN0KHBhcmFtcy5jb3JzKVxuXG4gIGZ1bmN0aW9uIGNiKHN0YXR1c0NvZGUsIHJlc3BvbnNlVGV4dCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgICBjYWxsYmFjayhyZXEuc3RhdHVzID09PSB1bmRlZmluZWQgPyBzdGF0dXNDb2RlIDogcmVxLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgcmVxLnN0YXR1cyA9PT0gMCA/IFwiRXJyb3JcIiA6IChyZXEucmVzcG9uc2UgfHwgcmVxLnJlc3BvbnNlVGV4dCB8fCByZXNwb25zZVRleHQpLFxuICAgICAgICAgICAgICAgICByZXEpXG4gICAgICAgIGNhbGxlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXEub3BlbihtZXRob2QsIHBhcmFtcy51cmwsIHRydWUpXG5cbiAgdmFyIHN1Y2Nlc3MgPSByZXEub25sb2FkID0gY2IoMjAwKVxuICByZXEub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChyZXEucmVhZHlTdGF0ZSA9PT0gNCkgc3VjY2VzcygpXG4gIH1cbiAgcmVxLm9uZXJyb3IgPSBjYihudWxsLCAnRXJyb3InKVxuICByZXEub250aW1lb3V0ID0gY2IobnVsbCwgJ1RpbWVvdXQnKVxuICByZXEub25hYm9ydCA9IGNiKG51bGwsICdBYm9ydCcpXG5cbiAgaWYgKGJvZHkpIHtcbiAgICBzZXREZWZhdWx0KGhlYWRlcnMsICdYLVJlcXVlc3RlZC1XaXRoJywgJ1hNTEh0dHBSZXF1ZXN0JylcblxuICAgIGlmICghZ2xvYmFsLkZvcm1EYXRhIHx8ICEoYm9keSBpbnN0YW5jZW9mIGdsb2JhbC5Gb3JtRGF0YSkpIHtcbiAgICAgIHNldERlZmF1bHQoaGVhZGVycywgJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKVxuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSByZXFmaWVsZHMubGVuZ3RoLCBmaWVsZDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgZmllbGQgPSByZXFmaWVsZHNbaV1cbiAgICBpZiAocGFyYW1zW2ZpZWxkXSAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmVxW2ZpZWxkXSA9IHBhcmFtc1tmaWVsZF1cbiAgfVxuXG4gIGZvciAodmFyIGZpZWxkIGluIGhlYWRlcnMpXG4gICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoZmllbGQsIGhlYWRlcnNbZmllbGRdKVxuXG4gIHJlcS5zZW5kKGJvZHkpXG5cbiAgcmV0dXJuIHJlcVxufVxuXG5mdW5jdGlvbiBnZXRSZXF1ZXN0KGNvcnMpIHtcbiAgLy8gWERvbWFpblJlcXVlc3QgaXMgb25seSB3YXkgdG8gZG8gQ09SUyBpbiBJRSA4IGFuZCA5XG4gIC8vIEJ1dCBYRG9tYWluUmVxdWVzdCBpc24ndCBzdGFuZGFyZHMtY29tcGF0aWJsZVxuICAvLyBOb3RhYmx5LCBpdCBkb2Vzbid0IGFsbG93IGNvb2tpZXMgdG8gYmUgc2VudCBvciBzZXQgYnkgc2VydmVyc1xuICAvLyBJRSAxMCsgaXMgc3RhbmRhcmRzLWNvbXBhdGlibGUgaW4gaXRzIFhNTEh0dHBSZXF1ZXN0XG4gIC8vIGJ1dCBJRSAxMCBjYW4gc3RpbGwgaGF2ZSBhbiBYRG9tYWluUmVxdWVzdCBvYmplY3QsIHNvIHdlIGRvbid0IHdhbnQgdG8gdXNlIGl0XG4gIGlmIChjb3JzICYmIGdsb2JhbC5YRG9tYWluUmVxdWVzdCAmJiAhL01TSUUgMS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSlcbiAgICByZXR1cm4gbmV3IFhEb21haW5SZXF1ZXN0XG4gIGlmIChnbG9iYWwuWE1MSHR0cFJlcXVlc3QpXG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdFxufVxuXG5mdW5jdGlvbiBzZXREZWZhdWx0KG9iaiwga2V5LCB2YWx1ZSkge1xuICBvYmpba2V5XSA9IG9ialtrZXldIHx8IHZhbHVlXG59XG4iLCJpbXBvcnQgeyB1cGRhdGVTZWxlY3RPcHRpb25zLCBtZXJnZSwgZmluZFNlbGVjdCwgZ2V0UHJvdmluY2VzLCBkaXNhYmxlLCBlbmFibGUgfSBmcm9tICcuL2xpYi91dGlscydcbmltcG9ydCB7IHJlcXVlc3RTaGlwcGluZ1JhdGVzLCBmZXRjaFNoaXBwaW5nUmF0ZXMgfSBmcm9tICcuL2xpYi9hamF4J1xuaW1wb3J0IHsgZm9ybWF0U3VjY2VzcywgZm9ybWF0RXJyb3IgfSAgZnJvbSAnLi9saWIvcmVzcG9uc2UnXG5cbmV4cG9ydCBkZWZhdWx0IChlbCwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGlmICh0eXBlb2Ygd2luZG93LkNvdW50cmllcyAhPT0gJ29iamVjdCcpeyByZXR1cm4gY29uc29sZS53YXJuKCdUaGUgZ2xvYmFsIENvdW50cmllcyBvYmplY3QgcmVxdWlyZWQgYnkgeW91ciBzaGlwcGluZyBjYWxjdWxhdG9yIGRvZXMgbm90IGV4aXN0LicpIH1cblxuY29uc29sZS5kaXIoZWwpXG4gIGNvbnN0IHNldHRpbmdzID0gbWVyZ2Uoe1xuICAgIGRlZmF1bHRDb3VudHJ5OiBudWxsLFxuICAgIGNvdW50cnk6ICcuanMtY291bnRyeScsXG4gICAgcHJvdmluY2U6ICcuanMtcHJvdmluY2UnLFxuICAgIHppcDogJy5qcy16aXAnLFxuICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiBjb25zb2xlLmRpcihkYXRhKSxcbiAgICBlcnJvcjogKGRhdGEpID0+IGFsZXJ0KGRhdGEpLFxuICAgIGVuZHBvaW50czoge1xuICAgICAgcHJlcGFyZTogJy9jYXJ0L3ByZXBhcmVfc2hpcHBpbmdfcmF0ZXMnLFxuICAgICAgZ2V0OiAnL2NhcnQvYXN5bmNfc2hpcHBpbmdfcmF0ZXMnXG4gICAgfVxuICB9LCBvcHRpb25zKVxuXG4gIC8vQ3JlYXRlIHJlZmVyZW5jZXMgdG8gRE9NIE5vZGVzXG4gIGNvbnN0IGNvdW50cnlTZWxlY3QgPSBlbC5xdWVyeVNlbGVjdG9yKHNldHRpbmdzLmNvdW50cnkpIFxuICBjb25zdCBwcm92aW5jZVNlbGVjdCA9IGVsLnF1ZXJ5U2VsZWN0b3Ioc2V0dGluZ3MucHJvdmluY2UpIFxuICBjb25zdCB6aXBJbnB1dCA9IGVsLnF1ZXJ5U2VsZWN0b3Ioc2V0dGluZ3MuemlwKVxuXG4gIC8vUmVuZGVyIHNlbGVjdCBvcHRpb25zIGJhc2VkIG9uIENvdW50cmllcyBKU09OIGFuZCBkZWZ1YWx0IHNlbGVjdGlvbnNcbiAgY29uc3Qgc2VsZWN0ZWRDb3VudHJ5ID0gdXBkYXRlU2VsZWN0T3B0aW9ucyhjb3VudHJ5U2VsZWN0LCBDb3VudHJpZXMsIHNldHRpbmdzLmRlZmF1bHRDb3VudHJ5KVxuICBjb25zdCBzZWxlY3RlZFByb3ZpbmNlID0gdXBkYXRlU2VsZWN0T3B0aW9ucyhwcm92aW5jZVNlbGVjdCwgZ2V0UHJvdmluY2VzKHNldHRpbmdzLmRlZmF1bHRDb3VudHJ5IHx8IE9iamVjdC5rZXlzKENvdW50cmllcylbMF0pKVxuXG4gIC8vTGF6eSBnZXR0ZXIgZm9yIGZvcm0gdmFsdWVzXG4gIGNvbnN0IG1vZGVsID0ge1xuICAgIGdldCBjb3VudHJ5KCl7XG4gICAgICByZXR1cm4gZmluZFNlbGVjdChjb3VudHJ5U2VsZWN0KS52YWx1ZVxuICAgIH0sXG4gICAgZ2V0IHByb3ZpbmNlKCl7XG4gICAgICByZXR1cm4gZmluZFNlbGVjdChwcm92aW5jZVNlbGVjdCkudmFsdWVcbiAgICB9LFxuICAgIGdldCB6aXAoKXtcbiAgICAgIHJldHVybiB6aXBJbnB1dC52YWx1ZVxuICAgIH0sXG4gIH1cblxuICAvL1Jlc3BvbmQgdG8gdGhlIGNvdW50cnkgY2hhbmdlIGV2ZW50XG4gIC8vdG8gY2hhbmdlIHN0YXRlIG9mIGRlcGVuZGFudCBwcm92aW5jZSBzZWxlY3RvclxuICBjb3VudHJ5U2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgbGV0IGF2YWlsYWJsZVByb3ZpbmNlcyA9IGdldFByb3ZpbmNlcyhtb2RlbC5jb3VudHJ5KSBcblxuICAgIGlmIChhdmFpbGFibGVQcm92aW5jZXMpe1xuICAgICAgdXBkYXRlU2VsZWN0T3B0aW9ucyhwcm92aW5jZVNlbGVjdCwgYXZhaWxhYmxlUHJvdmluY2VzKVxuICAgICAgZW5hYmxlKHByb3ZpbmNlU2VsZWN0KVxuICAgIH0gZWxzZSB7XG4gICAgICBwcm92aW5jZVNlbGVjdC5pbm5lckhUTUwgPSAnJ1xuICAgICAgZGlzYWJsZShwcm92aW5jZVNlbGVjdClcbiAgICB9XG4gIH0pXG5cbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGUpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7IFxuICAgIC8vSUUgc3VwcG9ydFxuICAgIGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcblxuICAgIGRpc2FibGUoZWwpXG5cbiAgICByZXF1ZXN0U2hpcHBpbmdSYXRlcyhzZXR0aW5ncy5lbmRwb2ludHMucHJlcGFyZSwgbW9kZWwsIChzdGF0dXMsIGRhdGEsIHJlcSkgPT4ge1xuICAgICAgbGV0IHN1Y2Nlc3MgPSBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8PSAzMDAgPyB0cnVlIDogZmFsc2VcblxuICAgICAgaWYgKHN1Y2Nlc3Mpe1xuICAgICAgICBmZXRjaFNoaXBwaW5nUmF0ZXMoc2V0dGluZ3MuZW5kcG9pbnRzLmdldCwgKHN0YXR1cywgZGF0YSwgcmVxKSA9PiB7XG4gICAgICAgICAgbGV0IHJlc3BvbnNlID0gZm9ybWF0U3VjY2VzcyhkYXRhKVxuICAgICAgICAgIHNldHRpbmdzLnN1Y2Nlc3MocmVzcG9uc2UpXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBmb3JtYXRFcnJvcihkYXRhKVxuICAgICAgICBzZXR0aW5ncy5lcnJvcihyZXNwb25zZSlcbiAgICAgIH1cblxuICAgICAgZW5hYmxlKGVsKVxuICAgIH0pXG5cbiAgfSlcblxuICByZXR1cm4gbW9kZWxcbn1cbiIsImltcG9ydCBuYW5vYWpheCBmcm9tICduYW5vYWpheCdcblxuY29uc3QgdG9RdWVyeVN0cmluZyA9IChmaWVsZHMpID0+IHtcbiAgbGV0IGRhdGEgPSAnJ1xuICBsZXQgbmFtZXMgPSBPYmplY3Qua2V5cyhmaWVsZHMpXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuYW1lcy5sZW5ndGg7IGkrKyl7XG4gICAgbGV0IG5hbWUgPSBuYW1lc1tpXVxuICAgIGxldCB2YWx1ZSA9IGZpZWxkc1tuYW1lXVxuICAgIGRhdGEgKz0gYCR7ZW5jb2RlVVJJQ29tcG9uZW50KGBzaGlwcGluZ19hZGRyZXNzWyR7bmFtZX1dYCl9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKX0ke2kgPCBuYW1lcy5sZW5ndGggLTEgPyAnJicgOiAnJ31gXG4gIH1cblxuICByZXR1cm4gZGF0YVxufVxuXG5leHBvcnQgY29uc3QgcmVxdWVzdFNoaXBwaW5nUmF0ZXMgPSAoZW5kcG9pbnQsIGRhdGEsIGNiKSA9PiBuYW5vYWpheC5hamF4KHtcbiAgbWV0aG9kOiAncG9zdCcsXG4gIHVybDogZW5kcG9pbnQsXG4gIGJvZHk6IHRvUXVlcnlTdHJpbmcoZGF0YSlcbn0sIGNiKVxuXG5leHBvcnQgY29uc3QgZmV0Y2hTaGlwcGluZ1JhdGVzID0gKGVuZHBvaW50LCBjYikgPT4gbmFub2FqYXguYWpheCh7IHVybDogZW5kcG9pbnQgfSwgY2IpXG4iLCJleHBvcnQgY29uc3QgZm9ybWF0U3VjY2VzcyA9IChkYXRhKSA9PiB7XG4gIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoZGF0YSlcbiAgY29uc3QgcmF0ZXMgPSBwYXJzZWQuc2hpcHBpbmdfcmF0ZXNcblxuICBpZiAoIXJhdGVzKXsgcmV0dXJuIH1cblxuICBjb25zdCByZXMgPSBbXSBcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHJhdGVzLmxlbmd0aDsgaSsrKXsgXG4gICAgbGV0IHJhdGUgPSByYXRlc1tpXVxuICAgIHJlcy5wdXNoKHtcbiAgICAgIHR5cGU6IHJhdGUubmFtZSxcbiAgICAgIHByaWNlOiByYXRlLnByaWNlXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiByZXMgXG59XG5cbmV4cG9ydCBjb25zdCBmb3JtYXRFcnJvciA9IChkYXRhKSA9PiB7XG4gIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoZGF0YSlcbiAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHBhcnNlZClcblxuICBsZXQgcmVzID0gJydcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspeyBcbiAgICBsZXQga2V5ID0ga2V5c1tpXVxuICAgIHJlcyArPSBgRXJyb3I6ICR7a2V5fSAke3BhcnNlZFtrZXldWzBdfSR7aSAhPT0ga2V5cy5sZW5ndGggLSAxID8gJywgJyA6ICcnfWAgXG4gIH1cblxuICByZXR1cm4gcmVzXG59XG5cbi8qKlxuICogVE9ET1xuICogV3JpdGUgYSBkZWZhdWx0IHRlbXBsYXRlIHRvIHJlbmRlciB0byBET01cbiAqL1xuIiwiLyoqXG4gKiBAcmV0dXJuIHthcnJheX0gQXJyYXkgb2YgcHJvdmluY2VzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQcm92aW5jZXMgPSBjb3VudHJ5ID0+IGNvdW50cnkgPyBDb3VudHJpZXNbY291bnRyeV0ucHJvdmluY2VzIDogbnVsbCBcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGVsZW1lbnQgcGFzc2VkLCBpZiBpdCdzIGEgPHNlbGVjdD4sXG4gKiBvdGhlcndpc2UgZmluZCB0aGUgPHNlbGVjdD4gd2l0aGluIHRoZSBwYXNzZWRcbiAqIG5vZGUgYW5kIHJldHVybiBpdC5cbiAqXG4gKiBAcmV0dXJuIHtlbGVtZW50fSBzZWxlY3RvIGVsZW1lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IGZpbmRTZWxlY3QgPSBvID0+IG8ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3NlbGVjdCcgPyBvIDogby5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2VsZWN0JylbMF1cblxuLyoqXG4gKiBTdGF0dXMgdXRpbHRpeSBmdW5jdGlvbnMsXG4gKiBmb3IgZHVyaW5nIGFqYXhcbiAqL1xuZXhwb3J0IGNvbnN0IGRpc2FibGUgPSB0YXJnZXQgPT4gdGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2lzLWRpc2FibGVkJylcbmV4cG9ydCBjb25zdCBlbmFibGUgPSB0YXJnZXQgPT4gdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWRpc2FibGVkJylcblxuLyoqXG4gKiBNZXJnZSB0d28gb2JqZWN0cyBpbnRvIGEgXG4gKiBuZXcgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCBSb290IG9iamVjdFxuICogQHBhcmFtIHtvYmplY3R9IHNvdXJjZSBPYmplY3QgdG8gbWVyZ2UgXG4gKlxuICogQHJldHVybiB7b2JqZWN0fSBBICpuZXcqIG9iamVjdCB3aXRoIGFsbCBwcm9wcyBvZiB0aGUgcGFzc2VkIG9iamVjdHNcbiAqL1xuZXhwb3J0IGNvbnN0IG1lcmdlID0gKHRhcmdldCwgLi4uYXJncykgPT4ge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspe1xuICAgIGxldCBzb3VyY2UgPSBhcmdzW2ldXG4gICAgZm9yIChsZXQga2V5IGluIHNvdXJjZSl7XG4gICAgICBpZiAoc291cmNlW2tleV0pIHRhcmdldFtrZXldID0gc291cmNlW2tleV1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0IFxufVxuXG4vKipcbiAqIENyZWF0ZXMgYW5kIHJldHVybnMgYW4gb3B0aW9uIHdpdGggXG4gKiB0aGUgcGFzc2VkIHZhbHVlIGFzIGJvdGggdGhlIHZhbHVlIFxuICogcHJvcGVydHkgYW5kIHRoZSBpbm5lckhUTUwgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHZhbCBMYWJlbCBhbmQgdmFsdWUgb2Ygb3B0aW9uXG4gKiBAcmV0dXJuIHtlbGVtZW50fSBvcHRpb24gZWxlbWVudFxuICovXG5jb25zdCBjcmVhdGVPcHRpb24gPSAodmFsID0gbnVsbCkgPT4ge1xuICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcblxuICBpZiAoIXZhbCl7IHJldHVybiB9XG5cbiAgZWwudmFsdWUgPSB2YWxcbiAgZWwuaW5uZXJIVE1MID0gdmFsXG5cbiAgcmV0dXJuIGVsXG59XG5cbi8qKlxuICogU2VsZWN0IGFuIG9wdGlvbiB3aXRoaW4gYSA8c2VsZWN0PlxuICogYmFzZWQgb24gYSBnaXZlbiB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBWYWx1ZSB0byBzZWFyY2ggZm9yXG4gKiBAcGFyYW0ge2VsZW1lbnR9IHNlbGVjdCA8c2VsZWN0PiBlbGVtZW50XG4gKiBAcmV0dXJuIHtlbGVtZW50fSBUaGUgZmlyc3QgbWF0Y2hpbmcgc2VsZWN0IG9wdGlvblxuICovXG5jb25zdCBzZWxlY3RPcHRpb24gPSAodmFsdWUsIHNlbGVjdCkgPT4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoc2VsZWN0Lm9wdGlvbnMpLmZpbHRlcihmdW5jdGlvbihvcHRpb24sIGkpe1xuICBpZiAob3B0aW9uLnZhbHVlID09PSB2YWx1ZSl7XG4gICAgc2VsZWN0LnNlbGVjdGVkSW5kZXggPSBpXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn0pWzBdXG5cbi8qKlxuICogR2VuZXJhdGUgc2VsZWN0IG9wdGlvbnMgZm9yIGEgZ2l2ZW4gc2VsZWN0IGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge2FycmF5fSBvcHRpb25zIEFycmF5IG9mIG9wdGlvbnMgXG4gKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSBzZWxlY3RlZCB2YWx1ZSBvZiB0aGUgdGFyZ2V0IHNlbGVjdCBlbGVtZW50XG4gKi8gXG5leHBvcnQgY29uc3QgdXBkYXRlU2VsZWN0T3B0aW9ucyA9IChzZWxlY3QsIG9wdGlvbnMsIHNlbGVjdGVkT3B0aW9uID0gbnVsbCkgPT4ge1xuICBjb25zdCB0YXJnZXQgPSBmaW5kU2VsZWN0KHNlbGVjdCkgXG4gIGNvbnN0IHByZXYgPSB0YXJnZXQub3B0aW9uc1swXSA/IHRhcmdldC5vcHRpb25zWzBdLnZhbHVlIDogZmFsc2UgXG5cbiAgb3B0aW9ucyA9IEFycmF5LmlzQXJyYXkob3B0aW9ucykgPyBvcHRpb25zIDogT2JqZWN0LmtleXMob3B0aW9ucylcblxuICBjb25zdCBzaG91bGRVcGRhdGUgPSAhcHJldiB8fCBvcHRpb25zWzBdICE9PSBwcmV2ID8gdHJ1ZSA6IGZhbHNlXG5cbiAgaWYgKHNob3VsZFVwZGF0ZSl7XG4gICAgdGFyZ2V0LmlubmVySFRNTCA9ICcnXG4gICAgb3B0aW9ucy5mb3JFYWNoKG8gPT4gdGFyZ2V0LmFwcGVuZENoaWxkKGNyZWF0ZU9wdGlvbihvKSkpXG4gIH1cblxuICBpZiAoc2VsZWN0ZWRPcHRpb24peyBzZWxlY3RPcHRpb24oc2VsZWN0ZWRPcHRpb24sIHRhcmdldCkgfVxuXG4gIHJldHVybiB0YXJnZXQudmFsdWVcbn1cbiIsImltcG9ydCB7c2VsZWN0Tm9kZXN9IGZyb20gXCIuLy4uL3NyYy9saWIvdXRpbHNcIlxuaW1wb3J0IGluc3RhbmNlIGZyb20gXCIuLy4uL3NyYy9pbmRleFwiXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uKCl7XG4gIGxldCBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWluaXQ9XCJzaGlwcGluZy1jYWxjdWxhdG9yXCJdJylcbiAgaW5zdGFuY2UoIGVsLCB7XG4gICAgZW5kcG9pbnRzOntcbiAgICAgIHByZXBhcmU6J2h0dHA6Ly9kZW1vNzA2MzYwMS5tb2NrYWJsZS5pby9wcmVwYXJlJyxcbiAgICAgIGdldDonaHR0cDovL2RlbW83MDYzNjAxLm1vY2thYmxlLmlvL2dldC1zaGlwcGluZy1yYXRlcydcbiAgICB9LFxuICAgIGRlZmF1bHRDb3VudHJ5OlwiQ2FuYWRhXCJcbiAgfSlcbn0pO1xuXG5cbiJdfQ==
