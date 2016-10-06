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
    },
    get meta(){
      return Countries[this.country]
    }
  }

  const instance = Object.create(loop(), {
    getState: {
      value: () => model 
    }
  })

  countrySelect.addEventListener('change', e => {
    let { provinces, zip_required } = Countries[model.country]

    if (provinces){
      updateSelectOptions(provinceSelect, provinces)
      provinceSelect.disabled = false
    } else {
      provinceSelect.innerHTML = ''
      provinceSelect.disabled = true
    }

    zip_required ? (
      zipInput.disabled = false 
    ) : (
      zipInput.disabled = true 
    )

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
  updateSelectOptions(provinceSelect, Countries[defaultCountry || Object.keys(Countries)[0]].provinces)

  return instance 
}
