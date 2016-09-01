"use strict";

var transform = {
  maxZoom : 3.3,
  minZoom : 0.9
};
transform.round = function(val, decimals){
  return Number( Math.round(val+'e'+decimals)+'e-'+decimals );
};
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
  return this.round(this.getElMatrix(img)[0], 2);

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
  };
};

transform.getCalcDistance = function(zoomScale, clientX, clientY, img){
  var
      rect = img.getBoundingClientRect()
    , cX = (rect.width/2)+rect.left
    , cY = (rect.height/2)+rect.top
    , xFromCenter = Math.abs(clientX - cX)
    , yFromCenter = Math.abs(clientY - cY)
    , distance = Math.sqrt( (yFromCenter*yFromCenter) + (xFromCenter*xFromCenter) );

  return distance*zoomScale;
};

transform.cloneZoom = function (img, matrix, newX, newY){
  var clone = img.cloneNode(true),
      newMatrix = matrix.slice(0);

  newMatrix[4] = newMatrix[4]+newX;
  newMatrix[5] = newMatrix[5]+newY;
  clone.classList.add('hidden');
  this.transformImage(clone, newMatrix);

  return clone;
};
transform.zoomBounds = function(img, matrix, xDist, yDist){

  var clone = this.cloneZoom(img, matrix, xDist, yDist);
  img.parentNode.appendChild(clone);
  var rect = clone.getBoundingClientRect(),
      newX, newY,
      oldX = matrix[4], oldY = matrix[5],
      bottom = window.innerHeight-rect.bottom,
      right = window.innerWidth-rect.right;
  if(rect.height > window.innerHeight){
    if(rect.top > 0){
      newY = oldY+(yDist-rect.top);
    }else if(bottom > 0){
      newY = oldY+(yDist+bottom);
    }else{
      newY = oldY+yDist;
    }
  }else{
    newY = 0;
  }
  if(rect.width > window.innerWidth){
    if(rect.left > 0){
      newX = oldX+(xDist-rect.left);
    }else if (right > 0){
      newX = oldX+(xDist+right);
    }else{
      newX = oldX+xDist;
    }
  }else{
    newX = 0;
  }
  img.parentNode.removeChild(clone);
  return{
    x: newX,
    y: newY
  };
};
transform.getMinZoom = function(img){
  var imgRect = img.getBoundingClientRect(),
      max = Math.max(imgRect.width, imgRect.height),
      scalePoint,
      nextClick = 0.25;

  if(max === imgRect.height){
    scalePoint = window.innerHeight / max;
  }else if(max === imgRect.width){
    scalePoint = window.innerWidth / max;
  }

  return this.round(scalePoint+nextClick, 2);
};
transform.getFocusPoint = function(clientX, clientY, img, zoomScale){
  if(typeof zoomScale === 'undefined'){
    zoomScale = 0;
  }
  var
    rect = img.getBoundingClientRect(),
    calcScale = (zoomScale >= 0) ? zoomScale+1 : zoomScale - 1,
    imgCX = (rect.width*calcScale)/2,
    imgCY = (rect.height*calcScale)/2;
  return {
    'x' : clientX,
    'y' : clientY,
    'cX': imgCX+rect.left,
    'cY': imgCY+rect.top
  };
};
transform.getNewFocusPoint = function(zoomScale, clientX, clientY, img){
  var
      focusPoint = this.getFocusPoint(clientX, clientY, img)
    , xFromCenter = focusPoint.x - focusPoint.cX
    , yFromCenter = focusPoint.y - focusPoint.cY
    , dist = Math.sqrt( Math.pow(xFromCenter, 2) + Math.pow(yFromCenter, 2))
    , calcDistance = dist*zoomScale
    , angle = Math.atan2((yFromCenter), xFromCenter)
    , move = calcDistance;
  var
      newX = focusPoint.x + (Math.cos(angle) * move)
    , newY = focusPoint.y + (Math.sin(angle) * move);

  return {
    x : newX,
    y : newY,
    distanceX : clientX-newX,
    distanceY : clientY-newY
  };
};
transform.getImageTransformMatrix = function(img, zoomScale, clientX, clientY){
  var transformStyle = window.getComputedStyle(img).transform;
  if(transformStyle === 'none'){
    img.style.transform = "scale(1,1)";
    transformStyle = window.getComputedStyle(img).transform;
  }
  var
    matrix = this.matrixArray(transformStyle),
    newPoint = this.getNewFocusPoint(zoomScale, clientX, clientY, img);
  if(  ((matrix[0] + zoomScale) <= this.maxZoom )
    && ((matrix[0] + zoomScale) >= this.minZoom )){
    matrix[0] = matrix[0] + zoomScale;
    matrix[3] = matrix[3]  + zoomScale;
    var panDistance = this.zoomBounds(img, matrix, newPoint.distanceX, newPoint.distanceY);
    matrix[4] = panDistance.x;
    matrix[5] = panDistance.y;
  }else if(matrix[0]+zoomScale >= this.maxZoom){
    matrix[0] = this.maxZoom;
    matrix[3] = this.maxZoom;
  }else if(matrix[0]+ zoomScale <=this.minZoom){
    matrix[0] = this.minZoom;
    matrix[3] = this.minZoom;
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
        if(xApproach && yApproach){
          clearInterval(moveInterval);
        }
      }, ms);
};
module.exports = transform;
