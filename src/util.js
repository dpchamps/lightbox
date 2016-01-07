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
