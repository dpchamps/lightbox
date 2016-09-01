
"use strict";
var imagePinch = function () {
  var lightbox = this;
  lightbox.events.add(function pinchListener(e){
    var
      img = e.target,
      zoomScale = (e.distance - e.initialPinch.distance)/500,
      cX = e.midPoint.x,
      cY = e.midPoint.y,
      oX = e.initialPinch.midPoint.x,
      oY = e.initialPinch.midPoint.y,
      matrix = lightbox.transform.getImageTransformMatrix(img, zoomScale, cX, cY),
      initialMatrix = lightbox.transform.getImageTransformMatrix(img, zoomScale, oX, oY);
    lightbox.transform.transformImage(img, matrix);
    lightbox.transform.translateImage(img, oX, oY, cX, cY, initialMatrix);
  });
};

module.exports = imagePinch;
