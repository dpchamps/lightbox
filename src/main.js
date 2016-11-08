/*globals touchme*/
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
  modal : require('./modules/lightboxModal'),
  init : function(thumbClass){
    if(typeof window.touchme === 'undefined'){
      throw new Error('Lightbox requires touchme.js as a dependency');
    }

    touchme({ holdThreshold: 50,
      swipeThreshold: 200,
      swipePrecision: 250,
      tapPrecision: 250,
      tapThreshold: 250,
      holdPrecision: 500});

    thumbClass = thumbClass || ".thumb";
    console.log(thumbClass);
    require('./modules/loadEvents.js')(this);
    this.controls = this.controls();
    var self = this;
    require('domready')(function(){
      document.addEventListener('touchend', function(e){
        e.preventDefault();
      });
      self.nav = self.nav(thumbClass);
      self.bindEvents(thumbClass);
    });
  },
  nodeAppended : null,
  openLightBox : function(node){
    var lightboxModal =  document.getElementById('lightbox-modal');
    lightboxModal.style.visibility = 'visible';
    document.body.style.overflow = 'hidden';
    this.nodeAppended = node;
    console.log(this.nodeAppended);
    lightboxModal.appendChild(this.nodeAppended);
  },
  closeLightBox : function(){
    var lightboxModal =  document.getElementById('lightbox-modal');
    lightboxModal.style.visibility = 'hidden';
    document.body.style.overflow = 'auto';
    lightboxModal.removeChild(this.nodeAppended);
    this.nodeAppended = null;
  },
  reCache : function(thumbClass){
    thumbClass = thumbClass || ".thumb";
    this.util(thumbClass).removeEvents(lightbox.events.get('thumbTap'));
    this.util(thumbClass).addEvents(lightbox.events.get('thumbTap'));
    this.nav.cacheCycle();
  }
};

window.lightbox = lightbox;


