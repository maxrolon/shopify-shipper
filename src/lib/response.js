export const formatSuccess = (data) => {
  const res = [] 
  const rates = JSON.parse(data).shipping_rates

  return rates ? rates.map(r => ({
    type: r.name,
    price: r.price
  })) : null
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
