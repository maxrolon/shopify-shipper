##Description
Fetch Shopify shipping rates for a particular address and render the results.

### Limitations
- For use in Shopify-hosted themes only. This module does not support CORS requests.
- Request ```/services/countries.js``` before your javascript bundle. This defines a "Countries" global that we use in this library

## Install 
```bash
npm i shopify-shipping-calculator --save
```

## Basic Usage
```javascript
import calculator from 'shopify-shipping-calculator'

let form = document.querySelector('.js-form')
calculator(form, {
  defaultCountry:"Canada"
})
```

## Configuration

**defaultCountry** {string}
- The preselected country shown on form load. Default: ```null```
```javascript
calculator(form, {
  defaultCountry:"Canada"
})
```

**country** {string}
- A selector string for the country select node. Default: ```.js-country```
```javascript
calculator(form, {
  country:".js-country"
})
```

**province** {string}
- A selector string for the province select node. Default: ```.js-province```
```javascript
calculator(form, {
  province:".js-province"
})
```

**zip** {string}
- A selector string for the zip input node. Default: ```.js-zip```

```javascript
calculator(form, {
  zip:".js-zip"
})
```

**success** {function}
- The callback function to run after the shipping rates have been succesfully returned.
- The callback is passed an array containing the available shipping rates.
```javascript
calculator(form, {
  success: (data) => alert(data)
})
```

**error** {function}
- The callback function to run if the shipping rates request ends in error
```javascript
calculator(form, {
  success: (data) => console.warn(data)
})
```

## API: Properties
```javascript

let instance = calculator(form, {
  defaultCountry:"Canada"
});

let country = instance.country //The currently selected country
let province = instance.province //The currently selected province
let zip = instance.zip //The currently selected zip code
```

## Markup
```html

<form class="js-form">
  <select class="js-country"></select>
  <select class="js-province"></select>
  <input type="text" class="js-zip">
  <input type="submit" value="submit">
</form>
```

## License 
MIT
