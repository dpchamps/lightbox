"use strict";
require('./modules/polyfill-checks.js');
var lightbox = {
  util : require('./modules/util.js'),
  events : require('./modules/events.js'),
  imgCache: require('./modules/imgCache.js'),
  translate: require('./modules/translate.js'),
  nav: require('./modules/nav.js'),
  init : function(){
    this.nav();
  }
};

window.lightbox = lightbox;


