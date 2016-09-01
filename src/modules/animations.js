/*
functions that move the image around the lightbox

all of these functions are chainable
 */
"use strict";

var translate = function(image){
  var
      timedFunctions = [],
      complete,
      done = new Promise(function(res){
        complete = res;
      });

  function wait(t, fn){
    return new Promise(function(res){
      setTimeout(function(){
        res(fn);
      }, t);
    });
  }
  function waterfall(){
      if(timedFunctions.length > 0){
        var timedFn = timedFunctions.shift();
        return wait(timedFn.t, timedFn.fn).then(function(fn){
          fn();
          waterfall();
        });
      }else{
        complete(image);
      }
  }
  function stack(t,fn){
    var timedFn = {t:t, fn:fn};
    timedFunctions.push(timedFn);
  }
  return{
    slideRight: function(){
      var idx;
      stack(0, function(){
        image.classList.add('pictureSlideRight');
        idx = image.dataset.idx;
      });
      stack(325, function(){
        image.classList.remove('pictureSlideRight');
        image.classList.add('hidden');
        image.style.transform = 'translateX(0)';
      });
      return this;
    },
    slideLeft: function(){
      var idx;
      stack(0, function(){
        image.classList.add('pictureSlideLeft');
        idx = image.dataset.idx;
      });
      stack(325, function(){
        image.classList.remove('pictureSlideLeft');
        image.classList.add('hidden');
        image.style.transform = 'translateX(0)';
      });
      return this;
    },
    center: function(){
      stack(0, function(){
        image.style.transition = 'all 250ms';
        image.style.transform = 'scale(1,1)';
      });
      stack(325, function(){

      });
      return this;
    },
    start: function(){
      waterfall();
      return done;
    }
  };
};

module.exports = translate;
