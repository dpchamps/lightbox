

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
    var idx = image.dataset.idx;
    imageSet[idx] = image.dataset.img;
    imageSet.last = (imageSet.last < idx) ? idx : imageSet.last;
  }
  var holdListener = lightbox.events.get('holdListener')
    , stopTapProp = lightbox.events.get('stopTapProp')
    , dbltapListener = lightbox.events.get('dbltapListener')
    , pinchListener = lightbox.events.get('pinchListener')
    , holdreleaseListener = lightbox.events.get('holdreleaseListener')
    , disableDefault = lightbox.events.get('disableDefault')
    , scrollWheelListener = lightbox.events.get('scrollWheelListener')
    , pinchReleaseListener = lightbox.events.get('pinchReleaseListener')
    , swipeListener = lightbox.events.get('swipeListener');


  function disableDrag(el){
    el.addEventListener('dragstart', disableDefault);
    el.addEventListener('dragend', disableDefault);
    el.addEventListener('drag', disableDefault);
  }
  function disableTouch(el){
    el.addEventListener('touchstart', disableDefault);
    el.addEventListener('touchmove',disableDefault);
  }
  function enableTouch(el){
    el.removeEventListener('touchstart', disableDefault);
    el.removeEventListener('touchmove',disableDefault);
  }
  function lightboxEnter(img){
    var
        idx = img.dataset.idx
      , src = imageSet[idx];
    lightbox.imgCache.loadImage(src).then(function(image){
      if(! cache.isComplete()){
        cache.cacheImages(imageSet);
      }
      addImage(idx, image);
    });
    lightboxModal.style.visibility = 'visible';
    document.body.style.overflow = 'hidden';
  }
  function lightboxExit(e){
    console.log(e.target);
    e.stopPropagation();
    var image = lightboxModal.getElementsByTagName('img')[0];
    if(typeof image !== 'undefined'){
      removeImage(image);
      removeTouchListeners(image);
    }
    enableTouch(document);
    lightboxModal.style.visibility = 'hidden';
    document.body.style.overflow = 'auto';
  }

  function addTouchListeners(el){
    disableDrag(el);
    disableTouch(document);
    el.addEventListener('tap', stopTapProp);
    el.addEventListener('dbltap', dbltapListener);
    el.addEventListener('hold', holdListener);
    el.addEventListener('pinch', pinchListener);
    el.addEventListener('holdrelease', holdreleaseListener);
    el.addEventListener('mousewheel', scrollWheelListener);
    el.addEventListener('pinchrelease', pinchReleaseListener);
    el.addEventListener('swipe', swipeListener);
  }
  function removeTouchListeners(el){
    el.removeEventListener('hold', holdListener);
    el.removeEventListener('pinch', pinchListener);
    el.removeEventListener('holdrelease', holdreleaseListener);
    el.removeEventListener('mousewheel', scrollWheelListener);
  }
  function addImage(idx, image){
    lightboxModal.dataset.idx = idx;
    lightboxModal.appendChild(image);
    addTouchListeners(image);
    lightboxModal.getElementsByTagName('img')[0].classList.remove('hidden');
  }
  function removeImage(image){
    lightboxModal.removeChild(image);
  }
  function nextImage(e){
    if(typeof e !== 'undefined'){
      e.stopPropagation();
    }
    var
        idx = parseInt(lightboxModal.dataset.idx)
      , curImg = lightboxModal.getElementsByTagName('img')[0]
      , nextImg = imageSet[idx+1]
      , newIdx = idx+1;
    if(typeof nextImg === 'undefined'){
      nextImg = imageSet[1];
      newIdx=1;
    }

    cache.loadImage(nextImg).then(function(image){
      var next = image;
      lightbox.animate(curImg).slideLeft().start().then(function(){
        removeImage(curImg);
        addImage(newIdx, next);
      });
    });
  }
  function prevImage(e){
    if(typeof e !== 'undefined'){
      e.stopPropagation();
    }
    var
        idx = parseInt(lightboxModal.dataset.idx)
      , curImg = lightboxModal.getElementsByTagName('img')[0]
      , prevImg = imageSet[idx-1]
      , newIdx = idx-1;
    if(typeof prevImg === 'undefined'){
      prevImg = imageSet[imageSet.last];
      newIdx = imageSet.last;
    }
    cache.loadImage(prevImg).then(function(image){
      var prev = image;
      lightbox.animate(curImg).slideRight().start().then(function(){
        removeImage(curImg);
        addImage(newIdx, prev);
      });
    });
  }
  return {
    addImage: addImage,
    removeImage: removeImage,
    next : nextImage,
    prev : prevImage,
    exit : lightboxExit,
    enter : lightboxEnter,
    imageSet : function(){
      return imageSet;
    }
  };
};

module.exports = nav;
