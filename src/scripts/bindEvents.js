"use strict";
var bindEvents = function (thumbClass) {
  if(this === 'undefined'){
    throw new Error();
  }
  require('./../eventlisteners/thumbTap').call(this);
  var
      lightbox = this
    , thumbTap = lightbox.events.get('thumbTap');

  lightbox.util(thumbClass).addEvents('tap', thumbTap);

  lightbox.controls.left.addEventListener('tap', lightbox.nav.prev);
  lightbox.controls.right.addEventListener('tap', lightbox.nav.next);
  lightbox.controls.remove.addEventListener('tap', lightbox.nav.exit);
  lightbox.controls.modal.addEventListener('tap', lightbox.nav.exit);
};

module.exports = bindEvents;
