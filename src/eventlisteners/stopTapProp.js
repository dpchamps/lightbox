"use strict";
var stopTapProp = function () {
  this.events.add(function stopTapProp(e){
    e.stopPropagation();
  });
};
module.exports = stopTapProp;
