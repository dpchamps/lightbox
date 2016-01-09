(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var lightbox = {
  util : require('./modules/util.js'),
  events : require('./modules/events.js'),
  imgCache: require('./modules/imgCache.js')
};

window.lightbox = lightbox;



},{"./modules/events.js":2,"./modules/imgCache.js":3,"./modules/util.js":4}],2:[function(require,module,exports){
/**
 * lightbox events / event  handlers
 *
 * provides a manageable and readable way of handling event binding / unbinding
 *
 * the _eventHash variable holds handlers to be attached to eventListeners.
 *
 * Because it can get messy storing global event handlers, or event handlers in the module space,
 * this module provides an easy way to reference the original event added to a node and remove it
 *
 * Internal structure:
 *
 *  _eventHash
 *    an object where the key will always equal a number id and the value will always be a function
 *
 *  _nameRef
 *    an object where the key will be a string and the value will be an id that exists in _enentHash
 *
 *  _id
 *    a pointer to the next position in the event hash
 */
"use strict";

 var events = {
  _eventHash: {},
  _nameRef: {},
  _id: 0
};

events.idExists = function(id){
  var exists = false;
  if(this._eventHash.hasOwnProperty(id)){
    exists = true;
  }

  return exists;
};
/*
  @events.getById
    Internal function, referenced by events.get. Should not be accessed directly.

    Throw an error if the id doesn't exist, return the function if it does.
 */
events.getById = function(id){
  if(!( this._eventHash.hasOwnProperty(id) )){
    throw new Error(id+" doesn't exist");
  }

  return this._eventHash[id];
};

/*
  @events.getId
    Retrieve the id of a name
 */
events.getId = function(name){
  if(!( this._nameRef.hasOwnProperty(name) )){
    throw new Error(name + " doesn't exist");
  }
  return this._nameRef[name];
};

/*
  @events.getByName
   Internal function, referenced by events.get. Should not be accessed directly.

   Checks if the name reference hash exists, throws an error or returns the id associated with it.
 */
events.getByName = function(name){
  var id = this.getId(name);
  return this._eventHash[id];
};

/*
  @events.add
    takes a function and adds it to the events hash.

    if the function is named, adds the name to a reference lookup table linking the name to the id of the function
    for lookup in the future

    returns the name of the function if it exists, returns the id otherwise
 */
events.add = function(handler){
  if(typeof handler !== 'function'){
    throw new Error('Expected type function for handler');
  }

  var referenceId = this._id,
      funcName = handler.name,
      hasName = (typeof funcName !== 'undefined' && funcName !== "");
  //if the function isn't anonymous, allow the lookup by function name
  if(hasName){
    //do not allow duplicates
    if(this._nameRef.hasOwnProperty(funcName)){
      throw new Error('Function already exists by name '+ funcName);
    } else{
      this._nameRef[funcName] = referenceId;
    }
  }

  this._eventHash[referenceId] = handler;
  this._id += 1;

  return (hasName) ? funcName : referenceId;
};

/*
  @events.get
    Returns a function in the events hash.

    If passed a string, the name reference hash is checked first, if that fails, it checks if the
    user passed a string of the id.

    If passed a number, the _eventHash is referenced directly
 */
events.get = function(handler){
  var func;

  switch(typeof handler){
    case 'string':
      try{
        func = this.getByName(handler);
      }
      catch(e){
        func = this.getById(parseInt(handler, 10));
      }
      break;
    case 'number':
      func = this.getById(handler);
          break;
    default:
      throw new Error('Expected string or number, received: '+ typeof(handler));
  }

  return func;
};

events.remove = function(handler){
  var func,
      id;

  switch(typeof handler){
    case 'string':
      try{
        id = this.getId(handler);
        delete this._nameRef[handler];
      }
      catch(e){
        if(this.idExists(handler)){
          id = parseInt(handler, 10);
        }else{
          throw new Error(handler+" doesn't exist");
        }
      }
      break;
    case 'number':
      if(this.idExists(handler)){
        id = parseInt(handler, 10);
      }else{
        throw new Error(handler+" doesn't exist");
      }
      break;
    default:
      throw new Error('Expected string or number, received: '+ typeof(handler));
  }

  func = this.getById(id);
  delete this._eventHash[id];

  return func;
};
/*
  @events.clear

    reset erreytang
 */
events.clear = function(){
  this._eventHash = {};
  this._nameRef = {};
  this._id = 0;
};


module.exports = events;

},{}],3:[function(require,module,exports){
"use strict";
var imgCache = function(){
  var _cache = [];
  function loadImage(src){
    return src;
  }
  return {
    loadImage : loadImage,
    cache : _cache
  };
};

module.exports = imgCache();

},{}],4:[function(require,module,exports){
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

module.exports = util;

},{}]},{},[1]);
