"use strict";
require('./modules/polyfill-checks.js');
var lightbox = {
  util : require('./modules/util.js'),
  events : require('./modules/events.js'),
  imgCache: require('./modules/imgCache.js'),
  translate: require('./modules/translate.js'),
  nav: require('./modules/nav.js'),
  bindEvents : require('./scripts/bindEvents'),
  controls : require('./modules/controls.js'),
  init : function(){
    this.controls = this.controls();
    this.nav();
    this.bindEvents();
  }
};

window.lightbox = lightbox;


