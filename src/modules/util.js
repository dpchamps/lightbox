/**
 * utilities functions, top level selector, etc
 */
"use strict";

var util = function(sel){
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
          for(var i = 0, j = nodeList.length; i < j; i ++){
            nodeList[i].addEventListener(event, handler);
          }
        },
        removeEvents : function(event,  handler){
          for(var i = 0, j = nodeList.length; i < j; i ++){
            nodeList[i].removeEventListener(event, handler);
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

module.exports = util;
