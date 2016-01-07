//the lightbox library namespace
var lightbox = {
  events : {},
  nav : {},
  zoom: {},

  init: function(){
    if(typeof touchme === 'undefined'){
      throw new Error('touchmejs dependency not included');
    }
    return true;
  }
};
