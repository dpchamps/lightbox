

"use strict";

var nav = function() {
  if(typeof this === 'undefined'){
    throw new Error("Navigation has no context, call after load");
  }
  var
      lightbox = this
    , thumbs = document.querySelectorAll('.thumb img')
    , imageSet = {last : 0}
    , cache = lightbox.imgCache
    , lightboxModal = document.getElementById('lightbox-modal');

  for(var i = 0; i<thumbs.length; i++){
    var image = thumbs[i];
    var idx = image.dataset.idx,
        bigImage = image.dataset.img;
    imageSet[idx] = bigImage;
    imageSet.last = (imageSet.last < idx) ? idx : imageSet.last;

  }
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
  var holdListener = lightbox.events.get('holdListener')
    , pinchListener = lightbox.events.get('pinchListener')
    , holdreleaseListener = lightbox.events.get('holdreleaseListener')
    , disableDefault = lightbox.events.get('disableDefault')
    , scrollWheelListener = lightbox.events.get('scrollWheelListener');


  function disableDrag(el){
    el.addEventListener('dragstart', disableDefault);
    el.addEventListener('dragend', disableDefault);
    el.addEventListener('drag', disableDefault);
  }
  function disableTouch(){
    document.addEventListener('touchstart', disableDefault);
    document.addEventListener('touchmove',disableDefault);
    document.addEventListener('touchend', disableDefault);
  }
  function enableTouch(){
    document.removeEventListener('touchstart', disableDefault);
    document.removeEventListener('touchmove',disableDefault);
    document.removeEventListener('touchend', disableDefault);
  }
  function lightboxEnter(){
    lightboxModal.style.visibility = 'visible';
    document.body.style.overflow = 'hidden';
  }
  function lightboxExit(){
    var image = lightboxModal.getElementsByTagName('img')[0];
    removeTouchListeners(image);
    removeImage(image);
    lightboxModal.style.visibility = 'hidden';
    document.body.style.overflow = 'auto';
  }

  function addTouchListeners(el){
    disableDrag(el);
    disableTouch();
    el.addEventListener('hold', holdListener);
    el.addEventListener('pinch', pinchListener);
    el.addEventListener('holdrelease', holdreleaseListener);
    el.addEventListener('mousewheel', scrollWheelListener);
  }
  function removeTouchListeners(el){
    enableTouch();
    el.removeEventListener('hold', holdListener);
    el.removeEventListener('pinch', pinchListener);
    el.removeEventListener('holdrelease', holdreleaseListener);
    el.removeEventListener('mousewheel', scrollWheelListener);
  }
  function addImage(idx, image){
    lightboxModal.dataset.idx = idx;
    lightboxModal.appendChild(image);
    lightboxModal.getElementsByTagName('img')[0].classList.remove('hidden');
  }
  function removeImage(image){
    lightboxModal.removeChild(image);
  }
  function nextImage(){
    var
        idx = lightboxModal.dataset.idx
      , curImg = imageSet[idx]
      , nextImg = imageSet[idx+1]
      , newIdx = idx+1;

    if(typeof nextImg === 'undefined'){
      nextImg = imageSet[1];
      newIdx=1;
    }

    cache.loadImage(nextImg).then(function(image){
      var next = image;
      lightbox.translate(curImg).slideLeft().start().then(function(){
        removeImage(curImg);
        addImage(newIdx, next);
      });
    });
  }
  function prevImage(){
    var
        idx = lightboxModal.dataset.idx
      , curImg = imageSet[idx]
      , prevImg = imageSet[idx-1]
      , newIdx = idx-1;

    if(typeof prevImg === 'undefined'){
      prevImg = imageSet[imageSet.last];
      newIdx = imageSet.last;
    }

    cache.loadImage(prevImg).then(function(image){
      var prev = image;
      lightbox.translate(curImg).slideRight().start().then(function(){
        removeImage(curImg);
        addImage(newIdx, prev);
      });
    });
  }
  return {
    next : nextImage,
    prev : prevImage,
    exit : lightboxExit,
    enter : lightboxEnter
  };
};

module.exports = nav;
