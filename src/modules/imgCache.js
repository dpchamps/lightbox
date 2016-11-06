"use strict";
var imgCache = function(){

  var hasCached = false,
      isComplete,
      processing = false,
      promise = new Promise(function(res){
        isComplete = res;
      });

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
      hasCached = false;
      processing = true;
      var pArray = [];
      
      for(var group in images){
        if(images.hasOwnProperty(group)){
          for(var idx in images[group]){
            if(images[group].hasOwnProperty(idx)){
              if(idx === 'last'){
                continue;
              }
              pArray.push( loadImage(images[group][idx]) );
            }
          }
        }
      }
      Promise.all(pArray).then(function(){
        //the images have been cached
        hasCached = true;
        processing = false;
      });
      return promise;
    },
    'complete' : function(){
      return promise;
    },
    'hasCached' : function(){
      return hasCached;
    },
    'processing' : function(){
      return processing;
    },
    'loadImage' : function(src){
      return loadImage(src);
    }
  };
};

module.exports = imgCache();
