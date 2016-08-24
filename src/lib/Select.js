import {createNode, addEvent, selectNodes} from './../lib/utils.js'

export default () => {

	return {
		make: function(name){
			let existing = selectNodes('[name="'+name+'"]', this._context);
			if (existing) return existing
			let select = createNode('select',{name:name})
			this._context.appendChild(select)
			return select
		},
		context: function(el){
			this._context = el
			return this
		},
		update: function(el, options=false){
			let values, option

			if (typeof options != 'string'){
				values = Object.keys(options)
			} else {
				values = Countries[options].provinces || false
			}

			el.innerHTML = ''
			el.value = ''

			if (values){
				el.style.visibility = 'visible'
			} else {
				el.style.visibility = 'hidden'
				return
			}
			for (let i=0;i < values.length;i++){
				let value = values[i]
				option = createNode('option',{value:value})
				option.innerHTML = value
				el.add(option)
			}
		}
	}

}
