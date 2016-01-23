
"use strict";
var imageHold = function () {
  var lightbox = this;
  function translateImageStart(img, x, y){
    var  initialMatrix =  lightbox.transform.getElMatrix(img);
    lightbox.events.add(function translateMouseMove(e){
      lightbox.transform.translateImage(img, x,y, e.x, e.y, initialMatrix);
    });
    lightbox.events.add(function translateTouchMove(e){
      if(e.touches.length > 1){
        img.removeEventListener('touchmove', lightbox.events.get('translateTouchMove'));
      }
      lightbox.transform.translateImage(img, x, y, e.touches[0].clientX, e.touches[0].clientY, initialMatrix);
    });
    img.addEventListener('mousemove', lightbox.events.get('translateMouseMove') );
    img.addEventListener('touchmove', lightbox.events.get('translateTouchMove') );
  }


  lightbox.events.add(function holdListener(e){
    translateImageStart(e.target, e.x, e.y);
  });
};

module.exports = imageHold;
