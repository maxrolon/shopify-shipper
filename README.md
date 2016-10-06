# Shopify Shipping Calculator 
Fetch shipping rates for a Shopify store based on country, province, and zip. 

#### Limitations
- For use in Shopify-hosted themes only. This module does not support CORS requests.
- Request `/services/countries.js` before your javascript bundle. This defines a `Countries` object on the window that this library depends on. 
  ```liquid
  {{ '/services/javascripts/countries.js' | script_tag }}
  ```
- See [markup requirements](#markup) below.

## Install 
```bash
npm i shopify-shipping-calculator --save
```

## Usage
```javascript
import shipper from 'shopify-shipping-calculator'

const form = document.querySelector('.js-form')

const calculator = shipper(form)

calculator.on('success', rates => handleSuccess(rates))
calculator.on('error', res => handleError(res))

calculator.on('change', { country, province, zip, meta } => {
  // hide/show needed fields, clear previous results, etc
})

calculator.getState()
/** returns
{
  country: 'United States',
  province: 'New York',
  zip: '10013',
  meta: {
    province_label: 'State',
    zip_label: 'Zip code',
    provinces: [...states]
  }
}
*/
```

## Configuration
#### calculator(form[, options])
This library takes two parameters: `form` and `options`. `form` should be the shipping calculator form element, and options is an object.
```javascript
// country will default to the first country in the `window['Countries']` object
const calculator = shipper(form)

// or, optionally specify a default country
const calculator = shipper(form, {
  defaultCountry: 'United States'
})
```

## Options 
#### defaultCountry `string`
The preselected country shown on form load. Default: `null`.
```javascript
const calculator = shipper(form, {
  defaultCountry: "Canada"
})
```

## Events
This library emits a few helpful events and exposes data that you can use to manage the state of the calculator UI.

#### success
Called after a successful fetch, returns an array of shipping rates:
```javascript
calculator.on('success', rates => {
  rates.forEach(r => resultsContainer.innerHTML += `${r.type}: ${r.price}`)
})
```

#### error 
Called after an unsuccessful fetch, returns an error message from the Shopify servers:
```javascript
calculator.on('error', res => console.warn(res))
```

#### change 
Called when the **country selector** changes, is passed the full state object returned from `.getState()`.
```javascript
calculator.on('change', { country, province, zip, meta } => {
  !!province ? (
    provinceSelector.style.display = 'block'
  ) : (
    provinceSelector.style.display = 'none'
  )
})
```

## API: Properties
#### .getState()
Returns an object representing the data fetched by the form.
```javascript
calculator.getState()

/** returns
{
  country: 'United States',
  province: 'New York',
  zip: '10013',
  meta: {
    province_label: 'State',
    zip_label: 'Zip code',
    provinces: [...states]
  }
}
*/
```

#### .on(event, callback)
Attach handlers for event emissions from the instance.
```javascript
calculator.on('success', rates => // do stuff)
```

## Markup
The only markup requirements for this library are a standard HTML form element that contains inputs with name attributes matching `country`, `province` and `zip`.
```html
<form class="js-form">
  <select name="country"></select>
  <select name="province"></select>
  <input type="text" name="zip">
  <input type="submit" value="submit">
</form>
```

## License 
MIT
