"use strict";
var loadEvents = function(context) {
  require('./../eventlisteners/disableDefault').call(context);
  require('./../eventlisteners/imageDblTap').call(context);
  require('./../eventlisteners/imageHold').call(context);
  require('./../eventlisteners/imageHoldRelease').call(context);
  require('./../eventlisteners/imagePinch').call(context);
  require('./../eventlisteners/imageScrollWheel').call(context);
  require('./../eventlisteners/imageSwipe').call(context);
  require('./../eventlisteners/stopTapProp').call(context);
};

module.exports = loadEvents;
