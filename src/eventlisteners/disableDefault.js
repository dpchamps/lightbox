"use strict";
var disableDefault = function () {
  this.events.add(function disableDefault(e){
    e.preventDefault();
  });
};

module.exports = disableDefault;
