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
        complete();
      }
  }
  function stack(t,fn){
    var timedFn = {t:t, fn:fn};
    timedFunctions.push(timedFn);
  }
  return{
    image : image,
    start: function(){
      waterfall();
      return done;
    },
    
    test1: function(){
      stack(1500, function(){
        console.log("test1");
      });
      return this;
    },
    test2: function(){
      stack(600, function(){
        console.log("test2");
      });
      return this;
    }
  };
};

module.exports = translate;
