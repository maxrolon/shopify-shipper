import './lib/polyfills'
import {selectNodes,addEvent} from './lib/utils'
import ajax from './lib/ajax'
import response from './lib/response'
import Lock from './lib/lock'
import Select from './lib/Select'

export default (el,args={}) => {
	let instance

	let settings = {
		endpoints:[
			'/cart/prepare_shipping_rates',
			'/cart/async_shipping_rates'
		],
		selectContainer:'[data-type="select-container"]',
		responseCb:response,
		defaultCountry:"United States"
	}
	Object.assign(settings,args)

	let selectWrap = selectNodes(settings.selectContainer,el);

	let select = Select().context(selectWrap)
	let country  = select.make('country')
	let province = select.make('province')
	let model = {
		isLocked: false,
		data:{}
	};

	addEvent(country, 'change', (e) => {
		model.country = e.target.value
	})

	addEvent(province, 'change', (e) => {
		model.province = e.target.value
	})

	select.update(country, Countries)

	function makeDescriptor(prop){
		return {
			get: function(){
				return this.data[prop]
			},
			set: function(val){
				this.data[prop]= val
			}
		}
	}

	Object.defineProperty(model,'country',{
		get: function(){
			return this.data.country
		},
		set: function(val){
			this.data.country = val
			country.value = val
			select.update(province, val)
			this.province = province.value
		}
	})

	Object.defineProperty(model,'province', makeDescriptor('province') )
	Object.defineProperty(model,'zip', makeDescriptor('zip') )

	let zip = selectNodes('[name="zip"]',el);

	addEvent(zip, 'blur', (e) => {
		model.zip = zip.value
	})

	let lock = Lock()
	lock.register(country,province,zip)
	
	//Handle the submission of the form
	addEvent(el, 'submit', (e) => {
		e.preventDefault()

		if ( lock.isLocked ) return false
		lock.lock()

		ajax( model.data, (code,data) => {
			lock.unLock()
			settings.responseCb.call(el,data,model.data)
		})
	})

	model.country = settings.defaultCountry

	return instance
}

