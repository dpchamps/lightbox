"use strict";
require('./modules/polyfill-checks.js');
var lightbox = {
  util : require('./modules/util.js'),
  events : require('./modules/events.js'),
  imgCache: require('./modules/imgCache.js'),
  animate: require('./modules/animations.js'),
  nav: require('./modules/nav.js'),
  bindEvents : require('./scripts/bindEvents'),
  controls : require('./modules/controls.js'),
  init : function(){
    touchme();
    this.controls = this.controls();
    var self = this;
    require('domready')(function(){
      console.log("load", document.body);
      self.nav = self.nav();
      self.bindEvents();
    });
  }
};

window.lightbox = lightbox;


