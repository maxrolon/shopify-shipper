Shipping Calculator for Shopify
==============================
Fetch Shopify shipping rates for a particular address and render the results.

### Limitations

For use in Shopify-hosted themes only. This module does not support CORS requests.

### Usage

HTML
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Shipping Calculator</title>
  </head>
  <body>
  	<form id="shippingCalculator">
		<select class="js-country></select>
		<select class="js-province></select>
		<input type="text" name="zip">
		<input type="submit" value="submit">
	</form>
    <script src="/services/countries.js"></script>
    <script src="main.js"></script>
  </body>
</html>
```
- Request ```/services/countries.js``` before your javascript bundle. This defines a "Countries" global that we use in this library
- Ensure that an input with name "zip" existings with-in the form element
- Ensure that an input with type "submit" existings with-in the form element
- Shipping results can be rendered in an [data-type="results"] element or rendering functionality can be overridden by a defined callback function (see below)
- Country and province selects will be added to the [data-type="select-container"] element or a defined element (see below)

Javascript
```javascript
import shippingCalculator from "./../src/main"

let form = document.getElementById('shippingCalculator')
shippingCalculator( form, {
	defaultCountry:"Canada",
	success:function(data){},
	error:function(data){}
})
```
### API

- **defaultCountry** - This will be selected immediately. Default: United States
- **success** - Will be called after a successful AJAX request completes. This function is passed an array of shipping data.
- **error** - Will be called if the AJAX request results in error. This function is passed an error string. 
- **country** - Query selector string (default:```.js-country```). Both a ```select``` node or ```div``` containing a ```select``` node are supported.
- **province** - Query selector string (default:```.js-province```). Both a ```select``` node or div containing a ```select``` node are supported.
- **zip** - Query selector string (default:```.js-province```). Expects an ```input[type="text"]``` node.

### Todo
1. Write tests

