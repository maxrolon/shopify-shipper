##ASAP TODO: Update readme

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
			<div data-type="select-container"></div>
			<input type="text" name="zip">
			<input type="submit" value="submit">
			<div data-type="result"></div>
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
	responseCb:function(JSONData,modelData){},
	selectContainer:'[data-type="select-container"]'
})
```

### Options

- **defaultCountry** - This will be selected immediately. Default: United States
- **reponseCb** - Will be called after the AJAX request completes. This function is passed the raw unparsed JSON from the AJAX request and the address data sent to the AJAX endpoint (Country, Province, Zip)
- **selectContainer** - A string to query the DOM with, to define where the Country and Province selects will be rendered

### Todo
1. Write tests

