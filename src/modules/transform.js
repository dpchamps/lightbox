/* globals */

"use strict";

var transform = {};
transform.matrixArray = function(matrix){
  matrix = matrix.split("(")[1];
  matrix = matrix.split(")")[0];
  matrix = matrix.split(',');
  matrix = matrix.map(parseFloat);
  return matrix;
};
transform.getElMatrix = function(el){
  if(window.getComputedStyle(el).transform === 'none'){
    el.style.transform = "scale(1,1)";
  }
  return this.matrixArray(window.getComputedStyle(el).transform);
};
transform.getXScale = function(img){
  return this.getElMatrix(img)[0];

};
transform.transformImage = function(img, matrix){
  img.style.transform = "matrix("+matrix.join()+")";
};
transform.getComputedRect = function(el){
  var
      width = parseInt(window.getComputedStyle(el).width.split('px')[0], 10)
    , height = parseInt(window.getComputedStyle(el).height.split('px')[0], 10);

  return {
    width:width,
    height:height
  }
};
transform.getFocusPoint = function(clientX, clientY, img, zoomScale){
  if(typeof zoomScale === 'undefined'){
    zoomScale = 0
  }
  var
    rect = img.getBoundingClientRect(),
    calcScale = (zoomScale >= 0) ? zoomScale+1 : zoomScale -1,
    viewportCX = window.innerWidth / 2,
    viewPortCY = window.innerHeight / 2,
    imgCX = (rect.width*calcScale)/2,
    imgCY = (rect.height*calcScale)/2,
    left = viewportCX - imgCX,
    top = viewPortCY - imgCY;
  return {
    'x' : (clientX+left),
    'y' : (clientY+top),
    'cX': imgCX+rect.left,
    'cY': imgCY+rect.top
  };
};
transform.getCalcFocusPoint = function(zoomScale, clientX, clientY, img){
  var
    width = parseInt(window.getComputedStyle(img).width.split('px')[0], 10),
    height = parseInt(window.getComputedStyle(img).height.split('px')[0], 10),
    calcScale = (zoomScale >= 0) ? zoomScale+1 : zoomScale -1,
    viewportCX = window.innerWidth / 2,
    viewportCY = window.innerHeight / 2,
    calcWidth =width * calcScale,
    calcHeight = height * calcScale,
    calcLeft = Math.round( viewportCX - (calcWidth/2)),
    calcTop = Math.round(viewportCY - (calcHeight/2));
  return {
    'x': clientX-calcLeft,
    'y': clientY-calcTop,
    'cX': (calcWidth/2)+calcLeft,
    'cY': (calcHeight/2)+calcTop
  }
};
transform.imageInBounds = function(rect, axis){
  var
    screenPercentage = 0.25,
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
};
transform.getImageTransformMatrix = function(img, zoomScale, clientX, clientY){
  var transformStyle = window.getComputedStyle(img).transform;
  if(transformStyle === 'none'){
    img.style.transform = "scale(1,1)";
    transformStyle = window.getComputedStyle(img).transform;
  }
  var
    focusPoint = this.getFocusPoint(clientX, clientY, img),
    calcFocusPoint = this.getCalcFocusPoint(zoomScale, clientX,clientY, img),
    //calcFocusPointTEST = this.getFocusPoint(clientX,clientY, img, zoomScale),
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
    matrix = this.matrixArray(transformStyle),
    transDirection = zoomScale >= 0 ? 1 : -1,
    distanceX = (focusPoint.x - newPoint.x),
    distanceY = (focusPoint.y - newPoint.y),
    imgRect = img.getBoundingClientRect();
  if(   ((matrix[0] + zoomScale) <= maxZoom )
    && ((matrix[0] + zoomScale) >= minZoom )){

    matrix[0] = matrix[0] + zoomScale;
    matrix[3] = matrix[3]  + zoomScale;

    if(transDirection > 0){
      //check if image is leaving the viewport
      if(this.imageInBounds(imgRect, 'x')){
        matrix[4] =  distanceX;
      }
      if(this.imageInBounds(imgRect, 'y')){
        matrix[5] = distanceY;
      }
    }else{
      if(matrix[0] <= 1){
        matrix[4] = 0;
        matrix[5] = 0;
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
};
transform.yAxisBounds = function(image, y, distance, curY){
  var box = image.getBoundingClientRect(),
      wHeight = window.innerHeight;

  if(box.height <= wHeight){
    return y;
  }
  if( curY+(wHeight-box.bottom) > (y+distance) ){
    return curY;
  }
  if(curY-box.top < (y+distance) ){
    return curY;
  }

  return y+distance;
};
transform.translateImage = function(el, oX, oY, nX, nY, initialMatrix){
  var
    image = el,
    box = image.getBoundingClientRect(),
    distanceScale = 0.75,
    xDistance = (nX - oX)*distanceScale,
    yDistance = (nY - oY)*distanceScale,
    matrix = this.getElMatrix(el);

  matrix[4] =  initialMatrix[4] + xDistance;
  matrix[5] = this.yAxisBounds(image, initialMatrix[5], yDistance, matrix[5]);
  this.transformImage(image, matrix);
};
transform.smoothTranslate = function(el, ms, x, y, precision){
  var matrix = this.getElMatrix(el),
      dX = x - matrix[4],
      dY = y - matrix[5],
      angle = Math.atan2(dY, dX),
      velocity = 15,
      xApproach = false,
      yApproach = false,
      self = this,
      moveInterval = setInterval(function(){
        if(  matrix[4] >= (x-precision)
          && matrix[4] <= (x+precision)){
          xApproach = true;
        }else if(
          el.getBoundingClientRect().right <= window.innerWidth
        ||el.getBoundingClientRect().left >= 0 ){
          xApproach = true;
        }else{
          matrix[4] += Math.cos(angle) * velocity;
        }
        if(  matrix[5] >= (y-precision)
          && matrix[5] <= (y+precision)){
          yApproach = true;
        }else if(
           el.getBoundingClientRect().bottom <= window.innerHeight
        || el.getBoundingClientRect().top >= 0
        ){
          yApproach = true;
        }else{
          matrix[5] += Math.sin(angle) * velocity;
        }
        self.transformImage(el, matrix);
        //console.log("working", matrix[4], x);
        if(xApproach && yApproach){
          clearInterval(moveInterval);
          console.log("smooting complete");
        }
      }, ms);
};
module.exports = transform;
