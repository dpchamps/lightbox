
"use strict";
var imageHoldRelease = function () {
  var lightbox = this;
  lightbox.events.add(function holdreleaseListener(e){
    var
      el = e.target,
      box = el.getBoundingClientRect(),
      navTarget = window.innerWidth*0.7,
      distance = Math.abs(e.originalX- e.lastX),
      transitionFired = false;
    if(lightbox.nav.imageCycle()){
      var
        next = lightbox.modal('next')[0]
        , nextMatrix
        , prev = lightbox.modal('prev')[0]
        , prevMatrix;
      if (next && next.complete){
        nextMatrix = lightbox.transform.getElMatrix(next);
      }
      if(prev && prev.complete){
        prevMatrix = lightbox.transform.getElMatrix(prev);
      }
    }

    if(box.right <= navTarget && distance > 150){
      lightbox.nav.next();
      transitionFired = true;
    }
    if(box.left >= navTarget/2 && distance > 150){
      lightbox.nav.prev();
      transitionFired = true;
    }
    if(box.width < window.innerWidth
      && box.height < window.innerHeight
      && distance < navTarget
      && transitionFired === false){
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
          if(nextMatrix){
              nextMatrix[4] = nextMatrix[4]-moveBy;
            lightbox.transform.transformImage(next, nextMatrix);
          }
          if(prevMatrix){
            prevMatrix[4] = prevMatrix[4]-moveBy;
            lightbox.transform.transformImage(prev, prevMatrix);
          }
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
