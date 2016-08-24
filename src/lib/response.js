import {selectNodes} from './utils'

export default function(data,modelData) {
	let el = selectNodes('[data-type="result"]',this)
	data = JSON.parse(data)

	if (!data['shipping_rates']) return 
	let rates = data['shipping_rates']
	let string = ''

	for (let i=0; i < rates.length; i++){
		string+=rates[i].name+": "+rates[i].price+"\r\n"
	}

	el.innerHTML = string
}
