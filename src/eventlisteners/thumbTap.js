
"use strict";
var thumbTap = function () {
  var lightbox = this;
  this.events.add(function thumbTap(e){
    e.stopPropagation();
    var img = this.getElementsByTagName('img')[0];
    console.log(img);
    lightbox.nav.enter(img);
  });
};
module.exports = thumbTap;
