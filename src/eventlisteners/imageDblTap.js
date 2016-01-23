"use strict";

var imageDbltap = function () {
  var lightbox = this;
  lightbox.events.add(function dbltapListener(e){

    var
      img = e.target,
      maxZoom = lightbox.transform.maxZoom,
      currentZoom = lightbox.transform.getXScale(img),
      zoomScale = currentZoom / maxZoom,
      cX = e.x,
      cY = e.y;

    var interval = setInterval(function(){
      var matrix = lightbox.transform.getImageTransformMatrix(img, zoomScale, cX, cY);
      currentZoom = lightbox.transform.getXScale(img);
      lightbox.transform.transformImage(img, matrix);
      if(currentZoom >= maxZoom){
        clearInterval(interval);
      }
    }, 15);
  });
};

module.exports = imageDbltap;
