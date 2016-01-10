/*
functions that move the image around the lightbox

all of these functions are chainable
 */
"use strict";

var translate = function(image){
  return{
    image: image
  };
};

module.exports = translate;
