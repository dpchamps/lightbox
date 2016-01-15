/* globals */

"use strict";
var bindEvents = function () {
  if(this === 'undefined'){
    throw new Error();
  }
  var
      lightbox = this
    , thumbTap = lightbox.events.get('thumbTap');

  lightbox.util('.thumb').addEvents('tap', thumbTap);
  lightbox.controls.left.addEventListener('tap', lightbox.nav.prev);
  lightbox.controls.right.addEventListener('tap', lightbox.nav.next);
  lightbox.controls.remove.addEventListener('tap', lightbox.nav.exit);
  lightbox.controls.modal.addEventListener('tap', lightbox.nav.exit);
};

module.exports = bindEvents;
