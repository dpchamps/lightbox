var galleryModule = function(){
  var touch = touchme({
    swipeThreshold: 150,
    holdThreshold: 5,
    tapThreshold: 20,
    precision: 20
  });

  if(!Modernizr.flexbox){
    $(".gallery").addClass('flex-wrap-fix');
  }

  if(Modernizr.touch){
    $('.touch-notification').removeClass('hidden');
  }
  var imageSet = {},
    imgCache = [],
    zoomed = false;
  $('.gallery .thumb img').each(function(idx, el){
    var imgData = $(el).data();
    imageSet[imgData['idx']] = imgData['img'];
  });
  var lastImage = 0;
  for(var idx in imageSet){
    if(lastImage < idx){
      lastImage = idx;
    }
  }
  function disableDefault(e){
    e.preventDefault();
  }
  function getElmatrix(el){
    if(window.getComputedStyle(el).transform === 'none'){
      el.style.transform = "scale(1,1)";
    }
    return matrixArray(window.getComputedStyle(el).transform);
  }
  function translateImage(el, oX, oY, nX, nY, initialMatrix){

    var image = $(el),
      distanceScale = 0.75,
      xDistance = (nX - oX)*distanceScale,
      yDistance = (nY - oY)*distanceScale,
      matrix = getElmatrix(el),
      threshold = 150;
    //todo check bounds
    matrix[4] =  initialMatrix[4] + xDistance;
    matrix[5] =  initialMatrix[5] + yDistance;

    transformImage(image, matrix);
    if(Math.abs(xDistance) > threshold){
      /*
       if(clientX > startX){
       leftAnimation(event);
       }else{
       rightAnimation(event)
       }
       */
    }
  }
  /*
  it's going to look ugly for now
   */
  var eventHandlers = {
    'modalTap' :  function(e){
      console.log(e.target);
      var closeTarget = $('.imagebox-controls')[0];
      if(e.target === closeTarget){
        imageboxExit();
      }
    },
    'thumbNailTap' : function(e){
      console.log(e.target);
      e.stopPropagation();
      var active = $(this).data(),
        src = imageSet[ active['idx'] ];
      imageboxEnter();
      loadImage(src).done(function(image){
        if(imgCache.length === 0){
          cacheImages();
        }
        $(image).on('click', function(e){
          e.stopPropagation();
        });
        $('#imagebox-modal').data('idx', active['idx']).append(image);
        addTouchListeners(image);
        zoomControls(image);
      });
    }
  };
  function translateImageStart(el, x, y){
    var image = $(el),
      imgRect = image[0].getBoundingClientRect(),
      threshhold = 150,
      focusPoint = getFocusPoint(x, y,image),
      initialMatrix =  getElmatrix(el);
    eventHandlers['translateMousemove'] = function(e){
      translateImage(el, x,y, e.x, e.y, initialMatrix);
    };
    eventHandlers['translateTouchmove'] = function(e){
      translateImage(el, x, y, e.touches[0].pageX, e.touches[0].pageY, initialMatrix);
    };
    el.addEventListener('mousemove', eventHandlers.translateMousemove);
    el.addEventListener('touchmove', eventHandlers.translateTouchmove);

  }
  function addTouchListeners(el){
    console.log("adding touch listeners");
    el.addEventListener('dragstart', function(e){
      e.preventDefault();
    });
    el.addEventListener('dragend', function(e){
      e.preventDefault();
    });
    el.addEventListener('drag', function(e){
      e.preventDefault();
    });
    eventHandlers['holdListener'] =  function(e){
        console.log('holding');
        translateImageStart(this, e.x, e.y);
      },
      eventHandlers['pinchListener'] = function(e){
        var zoomScale = (e.distance - e.initialPinch.distance)/100,
          cX = e.midPoint.x,
          cY = e.midPoint.y,
          matrix = getImageTransformMatrix($(el), zoomScale, cX, cY);
        transformImage($(el), matrix);
      };
    document.addEventListener('touchstart', disableDefault);
    document.addEventListener('touchmove',disableDefault);
    document.addEventListener('touchend', disableDefault);
    el.addEventListener('hold', eventHandlers.holdListener);
    el.addEventListener('pinch', eventHandlers.pinchListener);
    el.addEventListener('holdrelease', function(e){
      console.log('hold release');
      var distanceScale = 0.70,
        distance = (e.lastX - e.originalX)*distanceScale;
      if(Math.abs(distance) > 25){
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
      el.removeEventListener('mousemove', eventHandlers.translateMousemove);
      el.removeEventListener('touchmove', eventHandlers.translateTouchmove);
    });
  }
  function removeTouchListeners(el){
    //the imagebox is closing
    document.removeEventListener('touchstart', disableDefault);
    document.removeEventListener('touchmove',disableDefault);
    document.removeEventListener('touchend', disableDefault);
    el.removeEventListener('hold', eventHandlers.holdListener);
    el.removeEventListener('pinch', eventHandlers.pinchListener);
  }
  function matrixArray(matrix){
    matrix = matrix.split("(")[1];
    matrix = matrix.split(")")[0];
    matrix = matrix.split(',');
    matrix = matrix.map(parseFloat);
    return matrix;
  }
//since offset calculates the offset of the initial size of the image, we have to
// do it by finger
  function getFocusPoint(clientX, clientY, $img){
    var rect = $img[0].getBoundingClientRect(),
      viewportCX = window.innerWidth / 2,
      viewPortCY = window.innerHeight / 2,
      imgCX = rect.width/ 2,
      imgCY = rect.height/ 2,
      left = viewportCX - imgCX,
      top = viewPortCY - imgCY;

    return {
      'x' : (clientX+left),
      'y' : (clientY+top),
      'cX': (rect.width/2)+rect.left,
      'cY': (rect.height/2) +rect.top
    };
  }

  function getCalcFocusPoint(zoomScale, clientX, clientY, $img){
    var
      calcScale = (zoomScale >= 0) ? zoomScale+1 : zoomScale -1,
      calcWidth = $img.width()*calcScale,
      viewportCX = window.innerWidth / 2,
      viewportCY = window.innerHeight / 2,
      calcHeight = $img.height()*calcScale,
      calcLeft = Math.round( viewportCX - (calcWidth/2)),
      calcTop = Math.round(viewportCY - (calcHeight/2));

    return {
      'x': clientX-calcLeft,
      'y': clientY-calcTop,
      'cX': (calcWidth/2)+calcLeft,
      'cY': (calcHeight/2)+calcTop
    }
  }
  function imageInBounds(rect, axis){
    var screenPercentage = 0.25,
      vpW = (window.innerWidth/2) * screenPercentage,
      vpH = (window.innerHeight/2) * screenPercentage,
      gapFromLeft = rect.left,
      gapFromRight =window.innerWidth - rect.right,
      gapFromTop = rect.top,
      gapFromBottom = window.innerHeight - rect.bottom,
      boundsCheck = false;
    if(axis === 'x' || axis === 'X'){
      boundsCheck = (gapFromLeft < vpW && gapFromRight < vpW);
    }else if(axis === 'y' || axis === 'Y'){
      boundsCheck = (gapFromTop < vpH && gapFromBottom < vpH);
    }else {
      throw new Error('must define axis');
    }

    return boundsCheck;
  }
  function getImageTransformMatrix($img, zoomScale, clientX, clientY){
    var  transform = $img.css('transform');
    if(transform === 'none'){
      $img.css('transform', "scale(1,1)");
      transform = $img.css('transform');
    }

    var focusPoint = getFocusPoint(clientX, clientY, $img),
      calcFocusPoint = getCalcFocusPoint(zoomScale,clientX,clientY, $img),
      x_from_center = focusPoint.x - focusPoint.cX,
      y_from_center = focusPoint.y - focusPoint.cY,
      angle = Math.atan2((y_from_center), x_from_center),
      length = Math.sqrt( Math.pow(x_from_center, 2) + Math.pow(y_from_center, 2)),
      scaleFactor = Math.abs(zoomScale)+1,
      newPoint ={
        'x' : (scaleFactor * length * Math.cos(angle)) + calcFocusPoint.cX,
        'y' : (scaleFactor * length * Math.sin(angle)) + calcFocusPoint.cY
      },
      maxZoom = 2.5,
      minZoom = 1/3,
    //scale the image by delta
      matrix = matrixArray(transform),
      transDirection = zoomScale >= 0 ? 1 : -1,
      distanceX = (focusPoint.x - newPoint.x),
      distanceY = (focusPoint.y - newPoint.y),
      imgRect = $img[0].getBoundingClientRect();
    if(   ((matrix[0] + zoomScale) <= maxZoom )
      && ((matrix[0] + zoomScale) >= minZoom )){

      matrix[0] = matrix[0] + zoomScale;
      matrix[3] = matrix[3]  + zoomScale;

      if(transDirection > 0){
        //check if image is leaving the viewport
        if(imageInBounds(imgRect, 'x')){
          matrix[4] =  distanceX;
        }
        if(imageInBounds(imgRect, 'x')){
          matrix[5] = distanceY;
        }
      }else{
        if(matrix[0] <= 1){
          //matrix[4] = 0;
          //matrix[5] = 0;
        }else{
          matrix[4] = parseFloat(matrix[4])-(parseFloat(matrix[4])/6);
          matrix[5] = parseFloat(matrix[5])-(parseFloat(matrix[5])/6);
        }
      }
    }else{
      matrix[0] = ((matrix[0] + zoomScale) >= maxZoom) ? maxZoom : minZoom;
      matrix[3] = ((matrix[0] + zoomScale) >= maxZoom) ? maxZoom : minZoom;
    }
    return matrix;
  }


  function transformImage($img, matrix){
    $img.css({
      'transform' : "matrix("+matrix.join()+")"
    });
  }
  function zoomControls(img){
    var $img = $(img);

    $img.on('mousewheel', function(e){
      var delta = e.originalEvent.deltaY,
        zoomScale = -0.10;
      if(delta < 0){
        zoomScale = zoomScale*-1;
      }
      var matrix = getImageTransformMatrix($img, zoomScale, e.clientX, e.clientY);
      transformImage($img, matrix);
    });

  }

  function launchFullscreen(element) {
    if(element.requestFullscreen) {
      element.requestFullscreen();
    } else if(element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if(element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if(element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }
  function exitFullScreen(){

    if(document.exitFullscreen) {
      document.exitFullscreen();
    } else if(document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if(document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }

  function imageboxEnter(){
    var imgBox = $("#imagebox-modal");
    imgBox.css('visibility', 'visible');
    //launchFullscreen(imgBox[0]);
    $("body").css('overflow', 'hidden');
  }
  function imageboxExit(){
    removeTouchListeners($('#imagebox-modal img')[0]);
    $("#imagebox-modal").children('img').remove();
    $("#imagebox-modal").css('visibility', 'hidden');

    exitFullScreen();

    $("body").css('overflow', 'auto');
  }
  function loadImage(src){
    return $.Deferred(function(deferred){
      var img = new Image();
      img.onload = function(){
        deferred.resolve(img);
      };
      img.onerror = function(){
        deferred.reject(img);
      };
      img.src = src;
    }).promise();
  }
  function cacheImages(){
    //remove old array
    imgCache = [];
    for(var idx in imageSet){
      loadImage(imageSet[idx]).done(function(image){
        imgCache.push(image);
      });
    }
  }

  function nextImage(idx){
    var nextImg = imageSet[idx+1],
      newIdx = idx+1;

    if(typeof nextImg === 'undefined'){
      nextImg = imageSet[1];
      newIdx=1;
    }
    loadImage(nextImg).done(function(image){
      $('#imagebox-modal img').prop('src', image.src).removeClass('hidden');
      $("#imagebox-modal").data('idx', newIdx);
    });
  }
  function prevImage(idx){
    var prevImg = imageSet[idx-1],
      newIdx=idx-1;
    if(typeof prevImg === 'undefined'){
      prevImg = imageSet[lastImage];
      newIdx = lastImage;
    }
    loadImage(prevImg).done(function(image){
      $('#imagebox-modal img').prop('src', image.src).removeClass('hidden');
      $("#imagebox-modal").data('idx', newIdx);
    });
  }


  function leftAnimation(e){
    e.stopPropagation();
    $('#imagebox-modal img').addClass('pictureSlideRight');
    var idx = parseInt( $('#imagebox-modal').data('idx') );
    setTimeout(function(){
      $('#imagebox-modal img').removeClass('pictureSlideRight').addClass('hidden').css({
        'transform' : 'translateX(0%)',
        'webkit-transform' : 'translateX(0%)'
      });
      prevImage(idx);
    },325);
  }
  function rightAnimation(e){
    e.stopPropagation();
    $('#imagebox-modal img').addClass('pictureSlideLeft');
    var idx = parseInt( $('#imagebox-modal').data('idx') );
    setTimeout(function(){
      $('#imagebox-modal img').removeClass('pictureSlideLeft').addClass('hidden').css({
        'transform' : 'translateX(0%)',
        'webkit-transform' : 'translateX(0%)'
      });
      nextImage(idx);
    },325);
  }



  function removeAnimationEffects(){
    var gallery = $('.gallery'),
      thumbs = $('.gallery .thumb');
    gallery.removeClass('effect-8');
    thumbs.removeClass('animate');
  }
/*
  $('.gallery-nav a').on('click', function(e){
    //e.preventDefault();
    var currentSelection = $('.gallery-nav .selected'),
      thisSelection = $(this),
      gallery = $('.gallery'),
      thumbs = $('.gallery .thumb');
    thumbs.each(function(idx, el){
      var randDuration = (Math.random() * ( 0.6 - 0.3) + 0.3 ) + 's';

      el.style.WebkitAnimationDuration = randDuration;
      el.style.MozAnimationDuration = randDuration;
      el.style.animationDuration = randDuration;
    });
    removeAnimationEffects();
    currentSelection.removeClass('selected');
    thisSelection.addClass('selected');
    gallery.addClass('effect-8');
    thumbs.addClass('animate');
    setTimeout(function(){
      removeAnimationEffects();
    }, 800);
  });
  */
  function unbindEvents(){
    console.log("unbinding events");
    $('.imagebox-controls .glyphicon-chevron-left').off('tap', leftAnimation);
    $('.imagebox-controls .glyphicon-chevron-right').off('tap', rightAnimation);
    $('.imagebox-controls .glyphicon-remove').off('tap', imageboxExit);
    $('#imagebox-modal').off('tap', eventHandlers.modalTap);
    $('.thumb img').off('tap', eventHandlers.thumbNailTap);
  }
  //the main initialize. unbind, then bind all top level events
  function init(){
    console.log('initializing');
    unbindEvents();
    $('.imagebox-controls .glyphicon-chevron-left').on('tap', leftAnimation);
    $('.imagebox-controls .glyphicon-chevron-right').on('tap', rightAnimation);
    $('.imagebox-controls .glyphicon-remove').on('tap', imageboxExit);
    $('.thumb img').on('tap', eventHandlers.thumbNailTap);
  }
  //initialize the module
  init();
};
