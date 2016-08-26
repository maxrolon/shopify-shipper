import './shipper/polyfills'
import { selectNodes } from './shipper/utils'
import { requestShippingRates, fetchShippingRates } from './shipper/ajax'
import { formatSuccess, formatError }  from './shipper/response'
import Lock from './shipper/lock'
import Select from './shipper/Select'

export default (el, options = {}) => {
	const settings = Object.assign({}, {
    defaultCountry:"United States",
		countrySelector: '.js-country',
		provinceSelector: '.js-province',
    selectContainer: '.js-select-container',
    success: (data) => console.dir(data),
    error: (data) => alert(data),
    endpoints: {
      prepare: '/cart/prepare_shipping_rates',
      get: '/cart/async_shipping_rates'
    }
	}, options)

	const selectInstance = Select().context(el.querySelector(settings.selectContainer))
	const country  = selectInstance.make('country', settings.countrySelector)
	const province = selectInstance.make('province', settings.provinceSelector)
	const zip = selectNodes('[name="zip"]', el)
	const lock = Lock()

	const model = {
		isLocked: false,
		data: {},
    set country(val){
      this.data.country = val
      country.value = val
      selectInstance.update(province, val)
      this.province = province.value
    },
    get country(){
      return this.data.country
    },
    set province(val){
      this.data.province = val
    },
    get province(){
      return this.data.province
    },
    set zip(val){
      this.data.zip = val
    },
    get zip(){
      return this.data.zip
    }
	}

	lock.register(country, province, zip)

  if (Countries){
    selectInstance.update(country, Countries)
  } else {
    console.warn('Countries global object is not undefined.')
  }

  country.addEventListener('change', (e) => model.country = e.target.value)
  province.addEventListener('change', (e) => model.province = e.target.value)
  zip.addEventListener('blur', (e) => model.zip = e.target.value)

	model.country = settings.defaultCountry
	
	//Handle the submission of the form
  el.addEventListener('submit', (e) => {
		e.preventDefault()

		if (lock.isLocked) return false
		lock.lock()

    requestShippingRates(settings.endpoints.prepare, model.data, (status, data, req) => {
      let isValidAddress = status >= 200 && status <= 300 ? true : false

      if (isValidAddress){
        fetchShippingRates(settings.endpoints.get, (status, data, req) => {
          let response = formatSuccess(data)
          settings.success(response)
        })
      } else {
        let response = formatError(data)
        settings.error(response)
      }

      lock.unLock()
    })

    return false
	})
}
