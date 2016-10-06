/**
 * @return {array} Array of provinces
 */
export const getProvinces = country => country ? Countries[country].provinces : null 

/**
 * Creates and returns an option with 
 * the passed value as both the value 
 * property and the innerHTML property.
 *
 * @param {string} val Label and value of option
 * @return {element} option element
 */
const createOption = (val = null) => {
  if (!val){ return }

  let el = document.createElement('option')

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
const selectOption = (val, select) => [].slice.call(select.options).map((o, i) => {
  if (o.value === val) select.selectedIndex = i
})

/**
 * Generate select options for a given select element
 *
 * @param {array} options Array of options 
 * @return {string} the selected value of the target select element
 */ 
export const updateSelectOptions = (target, options, selectedOption = null) => {
  const prev = target.options[0] ? target.options[0].value : false 

  options = Array.isArray(options) ? options : Object.keys(options)

  const shouldUpdate = !prev || options[0] !== prev ? true : false

  if (shouldUpdate){
    target.innerHTML = ''
    options.forEach(o => target.appendChild(createOption(o)))
  }

  if (selectedOption){ selectOption(selectedOption, target) }

  return target.value
}
