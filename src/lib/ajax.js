import endpoints from './mock'

let nanoajax = require('nanoajax')

let data
let endCb

function toQueryString(obj){
	let str = ''
	for (let key in obj){
		str += key+'='+obj[key]+'&'
	}
	return str.slice(0, -1);
}

function prepare(){
	nanoajax.ajax({url:endpoints.prepare,body:toQueryString(data),method:"post"},get)
}

function get(){
	nanoajax.ajax({url:endpoints.get},endCb)
}

export default (inputs, cb) => {
	data = inputs
	endCb = cb
	prepare()
}
