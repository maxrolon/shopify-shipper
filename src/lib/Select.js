import {createNode, addEvent, selectNodes} from './utils'

export default () => {
	return {
		make: function(name, selector){
			const existing = this._context.querySelector(selector) 
      const nodeType = existing.nodeName

      if (existing){
        return nodeType === 'select' ? existing : existing.getElementsByTagName('select')[0]
      }

			const select = createNode('select', {name: name})

			this._context.appendChild(select)

			return select
		},
		context: function(el){
      console.log(el)
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
