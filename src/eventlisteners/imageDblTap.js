"use strict";

var imageDbltap = function () {
  var lightbox = this;
  lightbox.events.add(function dbltapListener(e){

    var
      img = e.target,
      currentZoom = lightbox.transform.getXScale(img),
      targetZoom = (currentZoom <= 1.5) ? lightbox.transform.maxZoom : 1,
      zoomScale = (targetZoom - currentZoom)*0.1,
      cX = e.x,
      cY = e.y;
    var interval = setInterval(function(){
      var matrix = lightbox.transform.getImageTransformMatrix(img, zoomScale, cX, cY);
      currentZoom = lightbox.transform.getXScale(img);
      lightbox.transform.transformImage(img, matrix);
      if(currentZoom === targetZoom || currentZoom+zoomScale >= lightbox.transform.maxZoom || currentZoom+zoomScale <= lightbox.transform.minZoom){
        clearInterval(interval);
      }
    }, 15);
  });
};

module.exports = imageDbltap;
