/**
 * Created by dave on 1/6/16.
 */
(function(){
  "use strict";
  var root = this,
      document = root.document;


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


/**
 * utilities functions, top level selector, etc
 */

lightbox.util = function(sel){
  var nodeList = [],
      getNodes = function(selector){
        selector = selector.trim();
        var nodeList = [],
          delimiter = selector[0],
          title = selector.split(delimiter)[1];
        switch(selector[0]){
          case '.':
            nodeList = document.getElementsByClassName(title);
            break;
          case '#':
            var node = document.getElementById(title);
            if( node !== null){
              nodeList.push(node);
            }
        }
        return nodeList;
      },
    /*
    selectorFunctions
      if utils are passed a selector, return the selector functions
     */
      selectorFunctions = {
        addEvents : function(event, handler){
          for (var node in nodeList) {
            if (nodeList.hasOwnProperty(node)) {
              nodeList[node].addEventListener(event, handler);
            }
          }
        },
        removeEvents : function(event,  handler){
          for (var node in nodeList) {
            if (nodeList.hasOwnProperty(node)) {
              nodeList[node].removeEventListener(event, handler);
            }
          }
        }
      },
    /*
    default functions
      functions that do not use a selector
     */
      defaultFunctions = {

      },
      //the api list that utilities will return
      apiFunctions;

  if(typeof sel === 'undefined'){
    apiFunctions = defaultFunctions;
  }else{
    nodeList = getNodes(sel);
    apiFunctions = selectorFunctions;
  }

  return apiFunctions;
};


/**
 * lightbox events / event  handlers
 */
lightbox.events = {
  //private
  _eventHash: {},

  return: {
    /*
     @add
     adds an array of nodes to an event

    add: function (selectors, event, handler) {
      if (typeof selectors === 'undefined') {
        return true;
      }

    },
    /*
     @remove
     removes an array of nodes from an event

    remove: function (selectors, event, handler) {

    }
    */
  }
};


/**
 * Created by dave on 1/6/16.
 */
root.lightbox = lightbox.init;
root.utils = lightbox.util;
}).call(this);
