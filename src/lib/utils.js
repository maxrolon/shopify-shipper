/**
 * @return {array} Array of provinces
 */
export const getProvinces = country => country ? Countries[country].provinces : null 

/**
 * Status utiltiy functions,
 * for during ajax
 */
export const disable = target => target.classList.add('is-disabled')
export const enable = target => target.classList.remove('is-disabled')

/**
 * Merge two objects into a 
 * new object
 *
 * @param {object} target Root object
 * @param {object} source Object to merge 
 *
 * @return {object} A *new* object with all props of the passed objects
 */
export const merge = (target, ...args) => {
  for (let i = 0; i < args.length; i++){
    let source = args[i]
    for (let key in source){
      if (source[key]) target[key] = source[key]
    }
  }

  return target 
}

/**
 * Creates and returns an option with 
 * the passed value as both the value 
 * property and the innerHTML property.
 *
 * @param {string} val Label and value of option
 * @return {element} option element
 */
const createOption = (val = null) => {
	var el = document.createElement('option');

  if (!val) return

  el.value = val
  el.innerHTML = val

	return el
}

/**
 * Select an option within a <select>
 * based on a given value
 *
 * @param {string} value Value to search for
 * @param {element} select <select> element
 * @return {element} The first matching select option
 */
const selectOption = (value, select) => Array.prototype.slice.call(select.options).filter(function(option, i){
  if (option.value === value){
    select.selectedIndex = i
    return true
  }
  return false
})[0]

/**
 * Generate select options for a given select element
 *
 * @param {array} options Array of options 
 * @return {string} the selected value of the target select element
 */ 
export const updateSelectOptions = (select, options, selectedOption = null) => {
  const target = select.nodeName === 'select' ? select : select.getElementsByTagName('select')[0]
  const prev = target.options[0] ? target.options[0].value : false 

  options = Array.isArray(options) ? options : Object.keys(options)

  const shouldUpdate = !prev || options[0] !== prev ? true : false

  if (shouldUpdate){
    target.innerHTML = ''
    options.forEach(o => target.appendChild(createOption(o)))
  }

  if (selectedOption) selectOption(selectedOption, target)

  return target.value
}
