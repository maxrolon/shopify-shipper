import {selectNodes} from "./../src/lib/utils"
import instance from "./../src/index"

document.addEventListener("DOMContentLoaded", function(){
  let el = document.querySelector('[data-init="shipping-calculator"]')
  instance( el, {
    endpoints:{
      prepare:'http://demo7063601.mockable.io/prepare',
      get:'http://demo7063601.mockable.io/get-shipping-rates'
    },
    defaultCountry:"Canada"
  })
});


