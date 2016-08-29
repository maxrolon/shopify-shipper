export const formatSuccess = (data) => {
  const parsed = JSON.parse(data)
  const rates = parsed.shipping_rates

  if (!rates){ return }

  const res = [] 

  for (let i = 0; i < rates.length; i++){ 
    let rate = rates[i]
    res.push({
      type: rate.name,
      price: rate.price
    })
  }

  return res 
}

export const formatError = (data) => {
  const parsed = JSON.parse(data)
  const keys = Object.keys(parsed)

  let res = ''

  for (let i = 0; i < keys.length; i++){ 
    let key = keys[i]
    res += `Error: ${key} ${parsed[key][0]}${i !== keys.length - 1 ? ', ' : ''}` 
  }

  return res
}

/**
 * TODO
 * Write a default template to render to DOM
 */
