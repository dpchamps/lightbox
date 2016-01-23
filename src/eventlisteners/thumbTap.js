
"use strict";
var thumbTap = function () {
  var nav = this.nav,
      cache = this.imgCache;
  this.events.add(function thumbTap(e){
    e.stopPropagation();
    var
      imageSet = nav.imageSet(),
      img = this.getElementsByTagName('img')[0],
      idx = img.dataset.idx,
      src = imageSet[idx];
    nav.enter();
    cache.loadImage(src).then(function(image){
      if(! cache.isComplete()){
        cache.cacheImages(imageSet);
      }
      nav.addImage(idx, image);
    });
  });
};
module.exports = thumbTap;
