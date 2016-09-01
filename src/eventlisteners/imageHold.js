
"use strict";
var imageHold = function () {
  var lightbox = this;
  function translateImageStart(img, x, y){
    var  initialMatrix =  lightbox.transform.getElMatrix(img);
    if(lightbox.nav.imageCycle()){
      var
        next = lightbox.modal('next')[0]
        , nextMatrix = lightbox.transform.getElMatrix(next)
        , prev = lightbox.modal('prev')[0]
        , prevMatrix = lightbox.transform.getElMatrix(prev);
    }
    lightbox.events.add(function translateMouseMove(e){
      lightbox.transform.translateImage(img, x,y, e.x, e.y, initialMatrix);
      if(nextMatrix){
        lightbox.transform.translateImage(next, x,y, e.x, e.y, nextMatrix);
      }
      if(prevMatrix){
        lightbox.transform.translateImage(prev, x,y, e.x, e.y, prevMatrix);
      }
    });
    lightbox.events.add(function translateTouchMove(e){
      if(e.touches.length > 1){
        img.removeEventListener('touchmove', lightbox.events.get('translateTouchMove'));
      }
      lightbox.transform.translateImage(img, x, y, e.touches[0].clientX, e.touches[0].clientY, initialMatrix);
      if(nextMatrix){
        lightbox.transform.translateImage(next, x,y, e.touches[0].clientX, e.touches[0].clientY, nextMatrix);
      }
      if(prevMatrix){
        lightbox.transform.translateImage(prev, x,y, e.touches[0].clientX, e.touches[0].clientY, prevMatrix);
      }
    });
    img.addEventListener('mousemove', lightbox.events.get('translateMouseMove') );
    img.addEventListener('touchmove', lightbox.events.get('translateTouchMove') );
  }

  lightbox.events.add(function holdListener(e){
    translateImageStart(e.target, e.x, e.y);
  });
};

module.exports = imageHold;
