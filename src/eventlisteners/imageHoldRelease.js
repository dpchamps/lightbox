
"use strict";
var imageHoldRelease = function () {
  var lightbox = this;
  lightbox.events.add(function holdreleaseListener(e){
    var
      el = e.target,
      box = el.getBoundingClientRect(),
      navTarget = window.innerWidth*0.7,
      tapEvent = new Event('tap'),
      distance = Math.abs(e.originalX- e.lastX);

    if(box.right <= navTarget && distance > 150){
      lightbox.controls.right.dispatchEvent(tapEvent);
    }
    if(box.left >= navTarget/2 && distance > 150){
      lightbox.controls.left.dispatchEvent(tapEvent);
    }
    if(box.width < window.innerWidth
      && box.height < window.innerHeight
      && distance < 150){
      var matrix = lightbox.transform.getElMatrix(el),
        moveBy = matrix[4]/5,
        moveInterval = setInterval(function(){
          matrix[4] = matrix[4]-moveBy;
          if(moveBy < 0 && matrix[4] > 0){
            matrix[4] = 0;
          }
          if(moveBy > 0 && matrix[4] < 0){
            matrix[4] = 0;
          }
          lightbox.transform.transformImage(el, matrix);
          if(Math.abs(matrix[4]) <= 0){
            clearInterval(moveInterval);
          }
        }, 15);
    }
    el.removeEventListener('mousemove', lightbox.events.get('translateMouseMove'));
    el.removeEventListener('touchmove', lightbox.events.get('translateTouchMove'));
    lightbox.events.remove('translateTouchMove');
    lightbox.events.remove('translateMouseMove');
  });
};

module.exports = imageHoldRelease;
