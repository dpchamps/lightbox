"use strict";
var imgCache = function(){

  var _cache = [],
      Promise = require('promise').Promise;
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
  function addImage(image){
    _cache.push(image);
  }

  return {
    'cacheImages' : function(images){
      _cache = [];
        for(var i = 0; i < images.length; i++){
            loadImage(images[i]).then(addImage);
        }
      },
    'cache' : _cache
  };
};

module.exports = imgCache();
