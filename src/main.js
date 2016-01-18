"use strict";
require('./modules/polyfill-checks.js');
var lightbox = {
  util : require('./modules/util.js'),
  events : require('./modules/events.js'),
  imgCache: require('./modules/imgCache.js'),
  animate: require('./modules/animations.js'),
  transform: require('./modules/transform.js'),
  nav: require('./modules/nav.js'),
  bindEvents : require('./scripts/bindEvents'),
  controls : require('./modules/controls.js'),
  init : function(){

    touchme({ holdThreshold: 50,
      swipeThreshold: 200,
      swipePrecision: 250,
      tapPrecision: 250,
      tapThreshold: 250,
      holdPrecision: 500});
    this.controls = this.controls();
    var self = this;
    require('domready')(function(){
      console.log("load", document.body);
      document.addEventListener('touchend', function(e){
        e.preventDefault();
      });
      self.nav = self.nav();
      self.bindEvents();
    });
  }
};

window.lightbox = lightbox;


