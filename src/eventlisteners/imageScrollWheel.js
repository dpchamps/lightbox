
"use strict";
var imageScrollWheel = function () {
  var lightbox = this;
  lightbox.events.add(function scrollWheelListener(e){
    var img = e.target;
    var delta = e.deltaY,
      zoomScale = -0.10;
    if(delta < 0){
      zoomScale = zoomScale*-1;
    }
    var matrix = lightbox.transform.getImageTransformMatrix(img, zoomScale, e.offsetX, e.offsetY);
    lightbox.transform.transformImage(img, matrix);
  });
};

module.exports = imageScrollWheel;
