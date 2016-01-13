/*globals Modernizr*/
/*
The lightbox relies on serveral features that might not be widely supported.
So let's try and make is flexible
 */
"use strict";

module.exports = (function(){
  require('browsernizr/test/dom/classlist.js');
  require('browsernizr/test/es6/promises.js');
  require('browsernizr/lib/prefixedCSS.js');
  require('browsernizr/test/css/transforms.js');

  window.Modernizr = require('browsernizr');

  if(Modernizr.classlist === false){
    require('classlist-polyfill');
  }

  if(Modernizr.promise === false){
    window.Promise = require('es6-promise').Promise;
  }

})();
