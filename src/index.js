import loop from 'loop.js'
import { 
  requestShippingRates, 
  fetchShippingRates 
} from './lib/ajax'
import { 
  formatSuccess, 
  formatError 
} from './lib/response'
import { 
  updateSelectOptions,
  getProvinces
} from './lib/utils'

if (typeof window.Countries !== 'object'){ throw new Error('The global Countries object required by your shipping calculator does not exist.') }

export default (el, opts = {}) => {
  const defaultCountry = opts.defaultCountry || null
  const endpoints = opts.endpoints || {
    prepare: '/cart/prepare_shipping_rates',
    get: '/cart/async_shipping_rates'
  } 

  const countrySelect = el.querySelector('[name="country"]') 
  const provinceSelect = el.querySelector('[name="province"]') 
  const zipInput = el.querySelector('[name="zip"]')
  const submitButton = el.querySelector('[type="submit"]')

  const model = {
    get country(){
      return countrySelect.value
    },
    get province(){
      return provinceSelect.value
    },
    get zip(){
      return zipInput.value
    }
  }

  const instance = Object.create(loop(), {
    model: {
      value: model
    }
  })

  countrySelect.addEventListener('change', (e) => {
    let availableProvinces = getProvinces(model.country) 

    if (availableProvinces){
      updateSelectOptions(provinceSelect, availableProvinces)
      provinceSelect.disabled = false
    } else {
      provinceSelect.innerHTML = ''
      provinceSelect.disabled = true
    }

    instance.emit('change', model)
  })

  el.addEventListener('submit', e => {
    e.preventDefault()
    e.returnValue = false // IE support

    instance.emit('submit', model)

    submitButton.disabled = true

    requestShippingRates(endpoints.prepare, model, (status, data, req) => {
      let success = status >= 200 && status <= 300 ? true : false

      if (success){
        fetchShippingRates(endpoints.get, (status, data, req) => {
          let response = formatSuccess(data)

          instance.emit('success', response)
        })
      } else {
        let response = formatError(data)
        instance.emit('error', response)
      }

      submitButton.disabled = false 
    })
  })

  /**
   * Init
   */
  updateSelectOptions(countrySelect, Countries, defaultCountry)
  updateSelectOptions(provinceSelect, getProvinces(defaultCountry || Object.keys(Countries)[0]))

  return instance 
}
