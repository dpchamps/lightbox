"use strict";
var imgCache = function(){

  var _complete = false;

  function loadImage(src){
    return new Promise(function(resolve, reject){
      var image = new Image();
      image.onload = function(){
        resolve(image);
      };
      image.onerror = function(){
        reject(image);
      };

      image.src = src;
    });
  }

  return {
    'cacheImages' : function(images){
      _complete = false;
      var pArray = [];
      for(var idx in images){
          if(idx === 'last'){
            continue;
          }
          pArray.push( loadImage(images[idx]) );
      }
      Promise.all(pArray).then(function(){
        //the images have been cached
        _complete = true;
      });
    },
    'isComplete' : function(){
      return _complete;
    },
    'loadImage' : function(src){
      return loadImage(src);
    }
  };
};

module.exports = imgCache();
