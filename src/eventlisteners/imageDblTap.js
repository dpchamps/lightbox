"use strict";

var imageDbltap = function () {
  var lightbox = this;
  lightbox.events.add(function dbltapListener(e){
    var
      img = e.target,
      currentZoom = lightbox.transform.getXScale(img),
      minZoomScale = lightbox.transform.getMinZoom(img),
      targetZoom = (currentZoom > 1) ? 1 : minZoomScale,
      zoomScale = (targetZoom - currentZoom)*0.5,
      cX = img.getBoundingClientRect().width/2,
      cY = img.getBoundingClientRect().height/2;
    var interval = setInterval(function(){
      var matrix = lightbox.transform.getImageTransformMatrix(img, zoomScale, cX, cY);
      currentZoom = lightbox.transform.getXScale(img);
      if(matrix[0] > targetZoom){
        matrix[0] = targetZoom;
        matrix[3] = targetZoom;
        matrix[4] = 0;
        matrix[5] = 0;
        lightbox.transform.transformImage(img, matrix);
        clearInterval(interval);
      }else if( currentZoom+zoomScale >= lightbox.transform.maxZoom ||
        currentZoom+zoomScale <= lightbox.transform.minZoom){
        clearInterval(interval);
      }

      lightbox.transform.transformImage(img, matrix);

    }, 15);
  });
};

module.exports = imageDbltap;
