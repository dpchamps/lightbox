

"use strict";

var nav = function(thumbClass) {
  if(typeof this === 'undefined'){
    throw new Error("Navigation has no context, call after load");
  }
  var
      lightbox = this
    , thumbs = document.querySelectorAll(thumbClass+' img')
    , imageSet = {}
    , cache = lightbox.imgCache
    , lightboxModal = document.getElementById('lightbox-modal')
    , imageCycle = false
    , currentGroup;
  function cacheCycle(){
    imageSet = {};
    for(var i = 0; i<thumbs.length; i++){
      var image = thumbs[i];
      var idx = image.dataset.idx;
      var group = image.dataset.imagegroup;
      if(typeof imageSet[group] === "undefined"){
        imageSet[group] = { last:0};
      }
      imageSet[group][idx] = image.dataset.img;
      imageSet[group].last = (imageSet[group].last < idx) ? idx : imageSet[group].last;
    }
  }
  cacheCycle();
  var holdListener = lightbox.events.get('holdListener')
    , stopTapProp = lightbox.events.get('stopTapProp')
    , dbltapListener = lightbox.events.get('dbltapListener')
    , pinchListener = lightbox.events.get('pinchListener')
    , holdreleaseListener = lightbox.events.get('holdreleaseListener')
    , disableDefault = lightbox.events.get('disableDefault')
    , scrollWheelListener = lightbox.events.get('scrollWheelListener')
    , swipeListener = lightbox.events.get('swipeListener');


  //initialize cache complete function
  lightbox.imgCache.complete().then(function(){
    lightbox.modal('spinner')[0].style.visibility = 'hidden';
  });
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
      , group = img.dataset.imagegroup
      , src = imageSet[group][idx];
    currentGroup = group;
    lightbox.imgCache.loadImage(src).then(function(image){
      addImage(idx, image);
      if(!lightbox.imgCache.hasCached() && !lightbox.imgCache.processing()){
        lightbox.imgCache.cacheImages(imageSet);
      }
    });
    lightboxModal.style.visibility = 'visible';
    document.body.style.overflow = 'hidden';
  }

  function lightboxExit(e){
    //e.stopPropagation();
    console.log(e.target, e.currentTarget);
    if(e.target !== e.currentTarget){
      return false;
    }
    var images = lightboxModal.getElementsByTagName('img');
    images  = Array.prototype.slice.call( images );

    for(var i = 0; i < images.length; i++){
      if(typeof images[i] !== 'undefined'){
        removeTouchListeners(images[i]);
        removeImage(images[i]);
      }
    }
    imageCycle = false;
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
    el.addEventListener('wheel', scrollWheelListener);
    //el.addEventListener('DOMMouseScroll', scrollWheelListener);
    el.addEventListener('swipe', swipeListener);
  }
  function removeTouchListeners(el){
    el.removeEventListener('hold', holdListener);
    el.removeEventListener('pinch', pinchListener);
    el.removeEventListener('holdrelease', holdreleaseListener);
    el.removeEventListener('wheel', scrollWheelListener);
    //el.addEventListener('DOMMouseScroll', scrollWheelListener);

  }
  function currentImage(){
    return lightboxModal.getElementsByClassName('current')[0];
  }
  function loadImageCycle(){
    var
        nextImage = getImage('next')
      , prevImage = getImage('prev');
    imageCycle = true;
    cache.loadImage(nextImage.image).then(function(image){
      addImage(nextImage.idx, image, 'next');
    });
    cache.loadImage(prevImage.image).then(function(image){
      addImage(prevImage.idx, image, 'prev');
    });

  }
  function hideImageCycle(){
    imageCycle = false;
    var images = [].slice.call(lightboxModal.getElementsByTagName('img'));
    images.forEach(function(image){
      if(image.classList.contains('current')){
        return;
      }
      removeImage(image);
    });
  }
  function reloadImageCycle(){
    hideImageCycle();
    loadImageCycle();
  }
  function addImage(idx, image, position){
    if(typeof position === "undefined"){
      position = 'current';
    }
    image.classList.add(position);
    lightboxModal.appendChild(image);
    if(position === 'current'){
      lightboxModal.dataset.idx = idx;
      addTouchListeners(image);
      reloadImageCycle();
    }
    var DOMImage =  lightboxModal.getElementsByTagName('img')[0];
    DOMImage.classList.remove('hidden');
  }
  function removeImage(image){
    lightboxModal.removeChild(image);
  }
  function getImage(position){
    var
      idx = parseInt(lightboxModal.dataset.idx, 10),
      newIdx,nextImg,prevImg,
      returnObj = {};
    switch(position){
      case 'next':
        nextImg = imageSet[currentGroup][idx+1];
        newIdx = idx+1;
        if(typeof nextImg === 'undefined'){
          nextImg = imageSet[currentGroup][1];
          newIdx=1;
        }
        returnObj = {
          image : nextImg,
          idx : newIdx
        };
            break;
      case 'prev':
      case 'previous':
        prevImg = imageSet[currentGroup][idx-1];
        newIdx = idx-1;
        if(typeof prevImg === 'undefined'){
          prevImg = imageSet[currentGroup][imageSet[currentGroup].last];
          newIdx = imageSet[currentGroup].last;
        }
        returnObj = {
          image : prevImg,
          idx : newIdx
        };
            break;
      default :
            throw new Error('position must be \'next\' \'prev\' or \'previous\'');
    }

    return returnObj;
  }
  function nextImage(e){
    if(typeof e !== 'undefined'){
     // e.stopPropagation();
    }
    var
        next = getImage('next')
      , curImg = lightboxModal.getElementsByClassName('current')[0]
      , nextImg = next.image
      , newIdx = next.idx;

    cache.loadImage(nextImg).then(function(image){
      var next = image;
      lightbox.animate(curImg).slideLeft().start().then(function(){
        removeImage(curImg);
        if(!imageCycle){
          addImage(newIdx, next);
        }
      });
      if(imageCycle){
        removeImage(lightbox.modal('prev')[0]);
        var nextImage = lightbox.modal('next')[0];
        lightbox.animate(nextImage).center().start().then(function(){
          addImage(newIdx, next);
        });
      }
    });
  }
  function prevImage(e){
    if(typeof e !== 'undefined'){
      //e.stopPropagation();
    }
    var
        prev = getImage('prev')
      , curImg = lightboxModal.getElementsByClassName('current')[0]
      , newIdx = prev.idx;

    cache.loadImage(prev.image).then(function(image){
      var prev = image;
      lightbox.animate(curImg).slideRight().start().then(function(){
        removeImage(curImg);
        if(!imageCycle){
          addImage(newIdx, prev);
        }
      });
      if(imageCycle){
        removeImage(lightbox.modal('next')[0]);
        var previousImage = lightbox.modal('prev')[0];
        lightbox.animate(previousImage).center().start().then(function(){
          addImage(newIdx, prev);
        });
      }
    });
  }
  return {
    addImage: addImage,
    removeImage: removeImage,
    getImage: function(position){
      return getImage(position);
    },
    addTouchListeners : function(image){
      addTouchListeners(image);
    },
    removeTouchListeners : function(image){
      removeTouchListeners(image);
    },
    next : nextImage,
    prev : prevImage,
    exit : lightboxExit,
    enter : lightboxEnter,
    imageSet : function(){
      return imageSet;
    },
    currentImage : currentImage,
    imageCycle : function(){
      return imageCycle;
    },
    loadImageCycle : loadImageCycle,
    hideImageCycle : hideImageCycle,
    cacheCycle: cacheCycle
  };
};

module.exports = nav;
