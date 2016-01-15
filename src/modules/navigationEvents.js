//add events
lightbox.events.add(function thumbTap(e){
  e.stopPropagation();
  var idx = this.dataset.idx,
    src = imageSet[idx];
  lightboxEnter();
  cache.loadImage(src).then(function(image){
    if(! cache.isComplete()){
      cache.cacheImages(imageSet);
    }
    addImage(idx, image);
    addTouchListeners(image);
  });
});
lightbox.events.add(function disableDefault(e){
  e.preventDefault();
});
lightbox.events.add(function holdListener(e){
  //translateImage
});
lightbox.events.add(function pinchListener(e){
  var zoomScale = (e.distance - e.initialPinch.distance)/100,
    cX = e.midPoint.x,
    cY = e.midPoint.y;
  // matrix = getImageTransformMatrix($(el), zoomScale, cX, cY);
  //transformImage($(el), matrix);
});
lightbox.events.add(function holdreleaseListener(e){
  var distanceScale = 0.70,
    distance = (e.lastX - e.originalX)*distanceScale;
  if(Math.abs(distance) > 25) {
    /*
     if(e.lastX > e.originalX){
     leftAnimation(event);
     }else{
     rightAnimation(event)
     }

     }else{
     /*
     $(el).css({
     'transform': 'translateX(0)',
     '-webkit-transform': 'translateX(0)'
     });
     */
  }
});
lightbox.events.add(function scrollWheelListener(e){
  var delta = e.originalEvent.deltaY,
    zoomScale = -0.10;
  if(delta < 0){
    zoomScale = zoomScale*-1;
  }
  //var matrix = getImageTransformMatrix($img, zoomScale, e.clientX, e.clientY);
  //transformImage($img, matrix);
});
