

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
    , lightboxModal = document.getElementById('lightbox-modal')
    , dbltapZoom = false;

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
  lightbox.events.add(function stopTapProp(e){
    console.log('tap');
    e.stopPropagation();
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
  lightbox.events.add(function dbltapListener(e){

    var
      img = e.target,
      maxZoom = 2,
      zoomScale = (dbltapZoom) ? maxZoom : 0.02,
      cX = e.x,
      cY = e.y;

    var interval = setInterval(function(){
      zoomScale+=0.1;
      var matrix = lightbox.transform.getImageTransformMatrix(img, zoomScale, cX, cY);
      lightbox.transform.transformImage(img, matrix);
      if(zoomScale >= maxZoom){
        clearInterval(interval);
      }
    }, 25);
  });
  lightbox.events.add(function pinchReleaseListener(e){
  });
  lightbox.events.add(function holdreleaseListener(e){
    var
      el = e.target,
      box = el.getBoundingClientRect(),
      navTarget = window.innerWidth*0.7,
      tapEvent = new Event('tap'),
      distance = Math.abs(e.originalX- e.lastX);

    if(box.right <= navTarget && distance > 150){
      lightbox.controls.right.dispatchEvent(tapEvent);
    }
    if(box.left >= navTarget/2 && distance > 150){
      lightbox.controls.left.dispatchEvent(tapEvent);
    }
    if(box.width < window.innerWidth
      && box.height < window.innerHeight
      && distance < 150){
      var matrix = lightbox.transform.getElMatrix(el),
          moveBy = matrix[4]/5,
          moveInterval = setInterval(function(){
            matrix[4] = matrix[4]-moveBy;
            if(moveBy < 0 && matrix[4] > 0){
              matrix[4] = 0;
            }
            if(moveBy > 0 && matrix[4] < 0){
              matrix[4] = 0;
            }
            lightbox.transform.transformImage(el, matrix);
            if(Math.abs(matrix[4]) <= 0){
              clearInterval(moveInterval);
            }
          }, 15);


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
    lightbox.transform.transformImage(img, matrix);
  });
  lightbox.events.add(function swipeListener(e){
    var quadrant = Math.floor((e.direction.degrees/90)%4 +1),
      image = e.target,
      matrix = lightbox.transform.getElMatrix(image),
      scale = matrix[0],
      slideScaleX = e.distance.x,
      slideScaleY = e.distance.y,
      isMultipleTouch = (e.touches && e.touches.length > 1),
      threshold = 75;
    if(isMultipleTouch){
      return false;
    }
    if(scale > 1.5){
      if(e.distance.x > threshold && e.distance.y <= threshold){
        switch(quadrant) {
          case 1:
          case 4:
            lightbox.transform.smoothTranslate(image, 5, matrix[4]+slideScaleX, matrix[5], 2);
                break;
          case 2:
          case 3:
            lightbox.transform.smoothTranslate(image, 5, matrix[4]-slideScaleX, matrix[5], 2);
            break;
        }
      }
      if(e.distance.y > threshold && e.distance.x <= threshold){
        switch (quadrant) {
          case 1:
          case 2:
            lightbox.transform.smoothTranslate(image, 5, matrix[4], matrix[5]-slideScaleY, 4);
            break;
          case 3:
          case 4:
            lightbox.transform.smoothTranslate(image, 5, matrix[4], matrix[5]+slideScaleY, 4);
            break;
        }
      }
      if(e.distance.y > threshold && e.distance.x > threshold){
        switch(quadrant){
          case 1:
            //up & right
            lightbox.transform.smoothTranslate(image, 5, matrix[4]+slideScaleX, matrix[5]-slideScaleY, 4);
            break;
          case 2:
            //up & left
            lightbox.transform.smoothTranslate(image, 5, matrix[4]-slideScaleX, matrix[5]-slideScaleY, 4);
            break;
          case 3:
            //down & left
            lightbox.transform.smoothTranslate(image, 5, matrix[4]-slideScaleX, matrix[5]+slideScaleY, 4);
            break;
          case 4:
            //down & right
            lightbox.transform.smoothTranslate(image, 5, matrix[4]+slideScaleX, matrix[5]+slideScaleY, 4);
            break
        }
      }
    }

  });
  var holdListener = lightbox.events.get('holdListener')
    , stopTapProp = lightbox.events.get('stopTapProp')
    , dbltapListener = lightbox.events.get('dbltapListener')
    , pinchListener = lightbox.events.get('pinchListener')
    , holdreleaseListener = lightbox.events.get('holdreleaseListener')
    , disableDefault = lightbox.events.get('disableDefault')
    , scrollWheelListener = lightbox.events.get('scrollWheelListener')
    , pinchReleaseListener = lightbox.events.get('pinchReleaseListener')
    , swipeListener = lightbox.events.get('swipeListener');

  function translateImageStart(img, x, y){
    var  initialMatrix =  lightbox.transform.getElMatrix(img);

    lightbox.events.add(function translateMouseMove(e){
      lightbox.transform.translateImage(img, x,y, e.x, e.y, initialMatrix);
    });
    lightbox.events.add(function translateTouchMove(e){
      if(e.touches.length > 1){
        img.removeEventListener('touchmove', lightbox.events.get('translateTouchMove'));
      }
      lightbox.transform.translateImage(img, x, y, e.touches[0].clientX, e.touches[0].clientY, initialMatrix);
    });
    img.addEventListener('mousemove', lightbox.events.get('translateMouseMove') );
    img.addEventListener('touchmove', lightbox.events.get('translateTouchMove') );
  }

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
  function lightboxEnter(){
    lightboxModal.style.visibility = 'visible';
    document.body.style.overflow = 'hidden';
  }
  function lightboxExit(e){
    console.log(e.target);
    e.stopPropagation();
    var image = lightboxModal.getElementsByTagName('img')[0];
    removeTouchListeners(image);
    removeImage(image);
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
    enableTouch(document);
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
