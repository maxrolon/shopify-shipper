import nanoajax from 'nanoajax'

const toQueryString = (fields) => {
  let data = ''
  let names = Object.keys(fields)

  for (let i = 0; i < names.length; i++){
    let name = names[i]
    let value = fields[name]
    data += `${encodeURIComponent(`shipping_address[${name}]`)}=${encodeURIComponent(value)}${i < names.length -1 ? '&' : ''}`
  }

  return data
}

export const requestShippingRates = (endpoint, data, cb) => nanoajax.ajax({
  method: 'post',
  url: endpoint,
  body: toQueryString(data)
}, cb)

export const fetchShippingRates = (endpoint, cb) => nanoajax.ajax({ url: endpoint }, cb)
