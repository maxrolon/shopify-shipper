import { updateSelectOptions, merge, findSelect, getProvinces, disable, enable } from './shipper/utils'
import { requestShippingRates, fetchShippingRates } from './shipper/ajax'
import { formatSuccess, formatError }  from './shipper/response'

export default (el, options = {}) => {
  if (typeof window.Countries !== 'object'){ return console.warn('The global Countries object required by your shipping calculator does not exist.') }

  const settings = merge({
    defaultCountry: null,
    country: '.js-country',
    province: '.js-province',
    zip: '.js-zip',
    success: (data) => console.dir(data),
    error: (data) => alert(data),
    endpoints: {
      prepare: '/cart/prepare_shipping_rates',
      get: '/cart/async_shipping_rates'
    }
  }, options)

  const countrySelect  = el.querySelector(settings.country) 
  const provinceSelect  = el.querySelector(settings.province) 
  const zipInput = el.querySelector(settings.zip)

  const selectedCountry = updateSelectOptions(countrySelect, Countries, settings.defaultCountry)
  const selectedProvince = updateSelectOptions(provinceSelect, getProvinces(settings.defaultCountry || Object.keys(Countries)[0]))

  const model = {
    get country(){
      return findSelect(countrySelect).value
    },
    get province(){
      return findSelect(provinceSelect).value
    },
    get zip(){
      return zipInput.value
    },
  }

  countrySelect.addEventListener('change', (e) => {
    let availableProvinces = getProvinces(model.country) 

    if (availableProvinces){
      updateSelectOptions(provinceSelect, availableProvinces)
      enable(provinceSelect)
    } else {
      disable(provinceSelect)
    }
  })

  el.addEventListener('submit', (e) => {
    e.preventDefault()

    disable(el)

    requestShippingRates(settings.endpoints.prepare, model, (status, data, req) => {
      let success = status >= 200 && status <= 300 ? true : false

      if (success){
        fetchShippingRates(settings.endpoints.get, (status, data, req) => {
          let response = formatSuccess(data)
          settings.success(response)
        })
      } else {
        let response = formatError(data)
        settings.error(response)
      }

      enable(el)
    })

    // IE10 support
    return false
  })

  return model
}
