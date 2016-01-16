

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
    var img = this.getElementsByTagName('img')[0];
    var idx = img.dataset.idx,
      src = imageSet[idx];
    lightboxEnter();
    cache.loadImage(src).then(function(image){
      if(! cache.isComplete()){
        cache.cacheImages(imageSet);
      }
      addImage(idx, image);
    });
  });
  lightbox.events.add(function disableDefault(e){
    e.preventDefault();
  });
  lightbox.events.add(function holdListener(e){
    translateImageStart(this, e.x, e.y);
  });
  lightbox.events.add(function pinchListener(e){
    var
      img = e.target,
      zoomScale = (e.distance - e.initialPinch.distance)/1000,
      cX = e.midPoint.x,
      cY = e.midPoint.y,
      oX = e.initialPinch.midPoint.x,
      oY = e.initialPinch.midPoint.y,
      matrix = lightbox.transform.getImageTransformMatrix(img, zoomScale, cX, cY),
      initialMatrix = lightbox.transform.getImageTransformMatrix(img, zoomScale, oX, oY);
      lightbox.transform.transformImage(img, matrix);
      lightbox.transform.translateImage(img, oX, oY, cX, cY, initialMatrix);

  });
  lightbox.events.add(function pinchReleaseListener(e){
    console.log('pinch release');
  });
  lightbox.events.add(function holdreleaseListener(e){
    console.log('hold release');
    var
      distanceScale = 0.70,
      distance = (e.lastX - e.originalX)*distanceScale,
      el = e.target;

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

    el.removeEventListener('mousemove', lightbox.events.get('translateMouseMove'));
    el.removeEventListener('touchmove', lightbox.events.get('translateTouchMove'));
    lightbox.events.remove('translateTouchMove');
    lightbox.events.remove('translateMouseMove');
  });
  lightbox.events.add(function scrollWheelListener(e){
    var img = e.target;
    var delta = e.deltaY,
      zoomScale = -0.10;
    if(delta < 0){
      zoomScale = zoomScale*-1;
    }
    var matrix = lightbox.transform.getImageTransformMatrix(img, zoomScale, e.clientX, e.clientY);
    console.log(matrix);
    lightbox.transform.transformImage(img, matrix);
  });
  var holdListener = lightbox.events.get('holdListener')
    , pinchListener = lightbox.events.get('pinchListener')
    , holdreleaseListener = lightbox.events.get('holdreleaseListener')
    , disableDefault = lightbox.events.get('disableDefault')
    , scrollWheelListener = lightbox.events.get('scrollWheelListener')
    , pinchReleaseListener = lightbox.events.get('pinchReleaseListener');

  function translateImageStart(img, x, y){
    var  initialMatrix =  lightbox.transform.getElMatrix(img);
    lightbox.events.add(function translateMouseMove(e){
      lightbox.transform.translateImage(img, x,y, e.x, e.y, initialMatrix);
    });
    lightbox.events.add(function translateTouchMove(e){
      if(e.touches.length > 1){
        return false;
      }
      lightbox.transform.translateImage(img, x, y, e.touches[0].pageX, e.touches[0].pageY, initialMatrix);
    });
    img.addEventListener('mousemove', lightbox.events.get('translateMouseMove') );
    img.addEventListener('touchmove', lightbox.events.get('translateTouchMove') );
  }

  function pinchMove(img, x, y){

  }

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
    console.log(el);
    disableDrag(el);
    disableTouch();
    el.addEventListener('hold', holdListener);
    el.addEventListener('pinch', pinchListener);
    el.addEventListener('holdrelease', holdreleaseListener);
    el.addEventListener('mousewheel', scrollWheelListener);
    el.addEventListener('pinchrelease', pinchReleaseListener);
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
    addTouchListeners(image);
    lightboxModal.getElementsByTagName('img')[0].classList.remove('hidden');
  }
  function removeImage(image){
    lightboxModal.removeChild(image);
  }
  function nextImage(e){
    e.stopPropagation();
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
    e.stopPropagation();
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
    next : nextImage,
    prev : prevImage,
    exit : lightboxExit,
    enter : lightboxEnter
  };
};

module.exports = nav;
