
"use strict";
var imageSwipe = function () {
  var lightbox = this;
  lightbox.events.add(function swipeListener(e){
    var quadrant = Math.floor((e.direction.degrees/90)%4 +1),
      image = e.target,
      matrix = lightbox.transform.getElMatrix(image),
      scale = matrix[0],
      slideScaleX = e.distance.x,
      slideScaleY = e.distance.y,
      isMultipleTouch = (e.touches && e.touches.length > 1),
      threshold = 75;
    if(isMultipleTouch){
      return false;
    }
    if(scale > 1.5){
      if(e.distance.x > threshold && e.distance.y <= threshold){
        switch(quadrant) {
          case 1:
          case 4:
            lightbox.transform.smoothTranslate(image, 5, matrix[4]+slideScaleX, matrix[5], 2);
            break;
          case 2:
          case 3:
            lightbox.transform.smoothTranslate(image, 5, matrix[4]-slideScaleX, matrix[5], 2);
            break;
        }
      }
      if(e.distance.y > threshold && e.distance.x <= threshold){
        switch (quadrant) {
          case 1:
          case 2:
            lightbox.transform.smoothTranslate(image, 5, matrix[4], matrix[5]-slideScaleY, 4);
            break;
          case 3:
          case 4:
            lightbox.transform.smoothTranslate(image, 5, matrix[4], matrix[5]+slideScaleY, 4);
            break;
        }
      }
      if(e.distance.y > threshold && e.distance.x > threshold){
        switch(quadrant){
          case 1:
            //up & right
            lightbox.transform.smoothTranslate(image, 5, matrix[4]+slideScaleX, matrix[5]-slideScaleY, 4);
            break;
          case 2:
            //up & left
            lightbox.transform.smoothTranslate(image, 5, matrix[4]-slideScaleX, matrix[5]-slideScaleY, 4);
            break;
          case 3:
            //down & left
            lightbox.transform.smoothTranslate(image, 5, matrix[4]-slideScaleX, matrix[5]+slideScaleY, 4);
            break;
          case 4:
            //down & right
            lightbox.transform.smoothTranslate(image, 5, matrix[4]+slideScaleX, matrix[5]+slideScaleY, 4);
            break
        }
      }
    }

  });
};

module.exports = imageSwipe;
