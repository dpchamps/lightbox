/*globals Modernizr*/
/*
The lightbox relies on serveral features that might not be widely supported.
So let's try and make is flexible
 */
"use strict";

module.exports = (function(){
  require('browsernizr/test/es6/promises.js');

  window.Modernizr = require('browsernizr');

  if(Modernizr.promise === false){
    window.Promise = require('es6-promise').Promise;
  }
})();
