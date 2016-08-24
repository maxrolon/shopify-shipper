import {selectNodes} from "./../src/lib/utils"
import instance from "./../src/main"

document.addEventListener("DOMContentLoaded", function(){
	let els = selectNodes('[data-init="shipping-calculator"]');
	for (let i=0;i<els.length;i++){
		instance( els[i], {
			endpoints:[
				'http://demo7063601.mockable.io/prepare',
				'http://demo7063601.mockable.io/get-shipping-rates'
			],
			defaultCountry:"Canada"
		})
	}
});
