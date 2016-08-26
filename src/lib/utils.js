function nodeArray(nodeList){
	return [].slice.call(nodeList);
}

export function selectNodes(string,el=false){
	let nodes = (el || document).querySelectorAll(string)
	if (!nodes.length) return false
	let nodesArray = nodeArray(nodes)
	if ( nodesArray.length == 1 ) return nodesArray[0]
	return nodesArray
}

export function createNode(name, attrs) {
	var el = document.createElement(name.toString());

	!!attrs && Object.keys(attrs).forEach(function(key) {
		el.setAttribute(key, attrs[key]);
	});

	return el;
}

export function addProps(){
	let isNode = prop.nodeType ? true : false
	let isNumber = 'number' === typeof prop ? true : false

	let key = isNumber || isNode ? 'range' : 'options'

	if (isNode || isNumber){
		Object.defineProperty(target, key, {
			value: prop,
			writable: true
		})
	} else if (!isNode) {
		Object.assign(target.options, prop)
	}
}
