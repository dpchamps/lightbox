"use strict";
var imgCache = function(){
  var _cache = [];
  function loadImage(src){
    return src;
  }
  return {
    loadImage : loadImage,
    cache : _cache
  };
};

module.exports = imgCache();
