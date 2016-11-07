require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Modernizr = require('./lib/Modernizr'),
    ModernizrProto = require('./lib/ModernizrProto'),
    classes = require('./lib/classes'),
    testRunner = require('./lib/testRunner'),
    setClasses = require('./lib/setClasses');

// Run each test
testRunner();

// Remove the "no-js" class if it exists
setClasses(classes);

delete ModernizrProto.addTest;
delete ModernizrProto.addAsyncTest;

// Run the things that are supposed to run after the tests
for (var i = 0; i < Modernizr._q.length; i++) {
  Modernizr._q[i]();
}

module.exports = Modernizr;

},{"./lib/Modernizr":2,"./lib/ModernizrProto":3,"./lib/classes":4,"./lib/setClasses":8,"./lib/testRunner":9}],2:[function(require,module,exports){
var ModernizrProto = require('./ModernizrProto.js');
  // Fake some of Object.create so we can force non test results to be non "own" properties.
  var Modernizr = function() {};
  Modernizr.prototype = ModernizrProto;

  // Leak modernizr globally when you `require` it rather than force it here.
  // Overwrite name so constructor name is nicer :D
  Modernizr = new Modernizr();

  module.exports = Modernizr;


},{"./ModernizrProto.js":3}],3:[function(require,module,exports){
var tests = require('./tests.js');
  /**
   *
   * ModernizrProto is the constructor for Modernizr
   *
   * @class
   * @access public
   */

  var ModernizrProto = {
    // The current version, dummy
    _version: '3.2.0 (browsernizr 2.0.1)',

    // Any settings that don't work as separate modules
    // can go in here as configuration.
    _config: {
      'classPrefix' : '',
      'enableClasses' : true,
      'enableJSClass' : true,
      'usePrefixes' : true
    },

    // Queue of tests
    _q: [],

    // Stub these for people who are listening
    on: function(test, cb) {
      // I don't really think people should do this, but we can
      // safe guard it a bit.
      // -- NOTE:: this gets WAY overridden in src/addTest for actual async tests.
      // This is in case people listen to synchronous tests. I would leave it out,
      // but the code to *disallow* sync tests in the real version of this
      // function is actually larger than this.
      var self = this;
      setTimeout(function() {
        cb(self[test]);
      }, 0);
    },

    addTest: function(name, fn, options) {
      tests.push({name : name, fn : fn, options : options});
    },

    addAsyncTest: function(fn) {
      tests.push({name : null, fn : fn});
    }
  };

  module.exports = ModernizrProto;


},{"./tests.js":10}],4:[function(require,module,exports){

  var classes = [];
  module.exports = classes;


},{}],5:[function(require,module,exports){

  /**
   * docElement is a convenience wrapper to grab the root element of the document
   *
   * @access private
   * @returns {HTMLElement|SVGElement} The root element of the document
   */

  var docElement = document.documentElement;
  module.exports = docElement;


},{}],6:[function(require,module,exports){

  /**
   * is returns a boolean if the typeof an obj is exactly type.
   *
   * @access private
   * @function is
   * @param {*} obj - A thing we want to check the type of
   * @param {string} type - A string to compare the typeof against
   * @returns {boolean}
   */

  function is(obj, type) {
    return typeof obj === type;
  }
  module.exports = is;


},{}],7:[function(require,module,exports){
var docElement = require('./docElement.js');
  /**
   * A convenience helper to check if the document we are running in is an SVG document
   *
   * @access private
   * @returns {boolean}
   */

  var isSVG = docElement.nodeName.toLowerCase() === 'svg';
  module.exports = isSVG;


},{"./docElement.js":5}],8:[function(require,module,exports){
var Modernizr = require('./Modernizr.js');
var docElement = require('./docElement.js');
var isSVG = require('./isSVG.js');
  /**
   * setClasses takes an array of class names and adds them to the root element
   *
   * @access private
   * @function setClasses
   * @param {string[]} classes - Array of class names
   */

  // Pass in an and array of class names, e.g.:
  //  ['no-webp', 'borderradius', ...]
  function setClasses(classes) {
    var className = docElement.className;
    var classPrefix = Modernizr._config.classPrefix || '';

    if (isSVG) {
      className = className.baseVal;
    }

    // Change `no-js` to `js` (independently of the `enableClasses` option)
    // Handle classPrefix on this too
    if (Modernizr._config.enableJSClass) {
      var reJS = new RegExp('(^|\\s)' + classPrefix + 'no-js(\\s|$)');
      className = className.replace(reJS, '$1' + classPrefix + 'js$2');
    }

    if (Modernizr._config.enableClasses) {
      // Add the new classes
      className += ' ' + classPrefix + classes.join(' ' + classPrefix);
      isSVG ? docElement.className.baseVal = className : docElement.className = className;
    }

  }

  module.exports = setClasses;


},{"./Modernizr.js":2,"./docElement.js":5,"./isSVG.js":7}],9:[function(require,module,exports){
var tests = require('./tests.js');
var Modernizr = require('./Modernizr.js');
var classes = require('./classes.js');
var is = require('./is.js');
  /**
   * Run through all tests and detect their support in the current UA.
   *
   * @access private
   */

  function testRunner() {
    var featureNames;
    var feature;
    var aliasIdx;
    var result;
    var nameIdx;
    var featureName;
    var featureNameSplit;

    for (var featureIdx in tests) {
      if (tests.hasOwnProperty(featureIdx)) {
        featureNames = [];
        feature = tests[featureIdx];
        // run the test, throw the return value into the Modernizr,
        // then based on that boolean, define an appropriate className
        // and push it into an array of classes we'll join later.
        //
        // If there is no name, it's an 'async' test that is run,
        // but not directly added to the object. That should
        // be done with a post-run addTest call.
        if (feature.name) {
          featureNames.push(feature.name.toLowerCase());

          if (feature.options && feature.options.aliases && feature.options.aliases.length) {
            // Add all the aliases into the names list
            for (aliasIdx = 0; aliasIdx < feature.options.aliases.length; aliasIdx++) {
              featureNames.push(feature.options.aliases[aliasIdx].toLowerCase());
            }
          }
        }

        // Run the test, or use the raw value if it's not a function
        result = is(feature.fn, 'function') ? feature.fn() : feature.fn;


        // Set each of the names on the Modernizr object
        for (nameIdx = 0; nameIdx < featureNames.length; nameIdx++) {
          featureName = featureNames[nameIdx];
          // Support dot properties as sub tests. We don't do checking to make sure
          // that the implied parent tests have been added. You must call them in
          // order (either in the test, or make the parent test a dependency).
          //
          // Cap it to TWO to make the logic simple and because who needs that kind of subtesting
          // hashtag famous last words
          featureNameSplit = featureName.split('.');

          if (featureNameSplit.length === 1) {
            Modernizr[featureNameSplit[0]] = result;
          } else {
            // cast to a Boolean, if not one already
            /* jshint -W053 */
            if (Modernizr[featureNameSplit[0]] && !(Modernizr[featureNameSplit[0]] instanceof Boolean)) {
              Modernizr[featureNameSplit[0]] = new Boolean(Modernizr[featureNameSplit[0]]);
            }

            Modernizr[featureNameSplit[0]][featureNameSplit[1]] = result;
          }

          classes.push((result ? '' : 'no-') + featureNameSplit.join('-'));
        }
      }
    }
  }
  module.exports = testRunner;


},{"./Modernizr.js":2,"./classes.js":4,"./is.js":6,"./tests.js":10}],10:[function(require,module,exports){

  var tests = [];
  module.exports = tests;


},{}],11:[function(require,module,exports){
/*!
{
  "name": "classList",
  "caniuse": "classlist",
  "property": "classlist",
  "tags": ["dom"],
  "builderAliases": ["dataview_api"],
  "notes": [{
    "name": "MDN Docs",
    "href": "https://developer.mozilla.org/en/DOM/element.classList"
  }]
}
!*/
var Modernizr = require('./../../lib/Modernizr.js');
var docElement = require('./../../lib/docElement.js');
  Modernizr.addTest('classlist', 'classList' in docElement);


},{"./../../lib/Modernizr.js":2,"./../../lib/docElement.js":5}],12:[function(require,module,exports){
/*!
{
  "name": "ES6 Promises",
  "property": "promises",
  "caniuse": "promises",
  "polyfills": ["es6promises"],
  "authors": ["Krister Kari", "Jake Archibald"],
  "tags": ["es6"],
  "notes": [{
    "name": "The ES6 promises spec",
    "href": "https://github.com/domenic/promises-unwrapping"
  },{
    "name": "Chromium dashboard - ES6 Promises",
    "href": "http://www.chromestatus.com/features/5681726336532480"
  },{
    "name": "JavaScript Promises: There and back again - HTML5 Rocks",
    "href": "http://www.html5rocks.com/en/tutorials/es6/promises/"
  }]
}
!*/
/* DOC
Check if browser implements ECMAScript 6 Promises per specification.
*/
var Modernizr = require('./../../lib/Modernizr.js');
  Modernizr.addTest('promises', function() {
    return 'Promise' in window &&
    // Some of these methods are missing from
    // Firefox/Chrome experimental implementations
    'resolve' in window.Promise &&
    'reject' in window.Promise &&
    'all' in window.Promise &&
    'race' in window.Promise &&
    // Older version of the spec had a resolver object
    // as the arg rather than a function
    (function() {
      var resolve;
      new window.Promise(function(r) { resolve = r; });
      return typeof resolve === 'function';
    }());
  });


},{"./../../lib/Modernizr.js":2}],13:[function(require,module,exports){
/*!
  * domready (c) Dustin Diaz 2014 - License MIT
  */
!function (name, definition) {

  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()

}('domready', function () {

  var fns = [], listener
    , doc = document
    , hack = doc.documentElement.doScroll
    , domContentLoaded = 'DOMContentLoaded'
    , loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState)


  if (!loaded)
  doc.addEventListener(domContentLoaded, listener = function () {
    doc.removeEventListener(domContentLoaded, listener)
    loaded = 1
    while (listener = fns.shift()) listener()
  })

  return function (fn) {
    loaded ? setTimeout(fn, 0) : fns.push(fn)
  }

});

},{}],14:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],15:[function(require,module,exports){
"use strict";
var disableDefault = function () {
  this.events.add(function disableDefault(e){
    e.preventDefault();
  });
};

module.exports = disableDefault;

},{}],16:[function(require,module,exports){
"use strict";

var imageDbltap = function () {
  var lightbox = this;
  lightbox.events.add(function dbltapListener(e){
    var
      img = e.target,
      currentZoom = lightbox.transform.getXScale(img),
      minZoomScale = lightbox.transform.getMinZoom(img),
      targetZoom = (currentZoom > 1) ? 1 : minZoomScale,
      zoomScale = (targetZoom - currentZoom)*0.5,
      cX = img.getBoundingClientRect().width/2,
      cY = img.getBoundingClientRect().height/2;
    var interval = setInterval(function(){
      var matrix = lightbox.transform.getImageTransformMatrix(img, zoomScale, cX, cY);
      currentZoom = lightbox.transform.getXScale(img);
      if(matrix[0] > targetZoom){
        matrix[0] = targetZoom;
        matrix[3] = targetZoom;
        matrix[4] = 0;
        matrix[5] = 0;
        lightbox.transform.transformImage(img, matrix);
        clearInterval(interval);
      }else if( currentZoom+zoomScale >= lightbox.transform.maxZoom ||
        currentZoom+zoomScale <= lightbox.transform.minZoom){
        clearInterval(interval);
      }

      lightbox.transform.transformImage(img, matrix);

    }, 15);
  });
};

module.exports = imageDbltap;

},{}],17:[function(require,module,exports){

"use strict";
var imageHold = function () {
  var lightbox = this;
  function translateImageStart(img, x, y){
    var  initialMatrix =  lightbox.transform.getElMatrix(img);
    if(lightbox.nav.imageCycle()){
      var
        next = lightbox.modal('next')[0]
        , nextMatrix = lightbox.transform.getElMatrix(next)
        , prev = lightbox.modal('prev')[0]
        , prevMatrix = lightbox.transform.getElMatrix(prev);
    }
    lightbox.events.add(function translateMouseMove(e){
      var nX = (e.x || e.clientX),
          nY = (e.y || e.clientY);
      lightbox.transform.translateImage(img, x,y, nX, nY, initialMatrix);
      if(nextMatrix){
        lightbox.transform.translateImage(next, x,y, nX, nY, nextMatrix);
      }
      if(prevMatrix){
        lightbox.transform.translateImage(prev, x,y, nX, nY, prevMatrix);
      }
    });
    lightbox.events.add(function translateTouchMove(e){
      if(e.touches.length > 1){
        img.removeEventListener('touchmove', lightbox.events.get('translateTouchMove'));
      }
      lightbox.transform.translateImage(img, x, y, e.touches[0].clientX, e.touches[0].clientY, initialMatrix);
      if(nextMatrix){
        lightbox.transform.translateImage(next, x,y, e.touches[0].clientX, e.touches[0].clientY, nextMatrix);
      }
      if(prevMatrix){
        lightbox.transform.translateImage(prev, x,y, e.touches[0].clientX, e.touches[0].clientY, prevMatrix);
      }
    });
    img.addEventListener('mousemove', lightbox.events.get('translateMouseMove') );
    img.addEventListener('touchmove', lightbox.events.get('translateTouchMove') );
  }

  lightbox.events.add(function holdListener(e){
    translateImageStart(e.target, e.x, e.y);
  });
};

module.exports = imageHold;

},{}],18:[function(require,module,exports){

"use strict";
var imageHoldRelease = function () {
  var lightbox = this;
  lightbox.events.add(function holdreleaseListener(e){
    var
      el = e.target,
      box = el.getBoundingClientRect(),
      navTarget = window.innerWidth*0.7,
      distance = Math.abs(e.originalX- e.lastX),
      transitionFired = false;
    if(lightbox.nav.imageCycle()){
      var
        next = lightbox.modal('next')[0]
        , nextMatrix = lightbox.transform.getElMatrix(next)
        , prev = lightbox.modal('prev')[0]
        , prevMatrix = lightbox.transform.getElMatrix(prev);
    }

    if(box.right <= navTarget && distance > 150){
      lightbox.nav.next();
      transitionFired = true;
    }
    if(box.left >= navTarget/2 && distance > 150){
      lightbox.nav.prev();
      transitionFired = true;
    }
    if(box.width < window.innerWidth
      && box.height < window.innerHeight
      && distance < navTarget
      && transitionFired === false){
      var matrix = lightbox.transform.getElMatrix(el),
        moveBy = matrix[4]/5,
        moveInterval = setInterval(function(){
          matrix[4] = matrix[4]-moveBy;
          if(moveBy < 0 && matrix[4] > 0){
            matrix[4] = 0;
          }
          if(moveBy > 0 && matrix[4] < 0){
            matrix[4] = 0;
          }
          lightbox.transform.transformImage(el, matrix);
          if(nextMatrix){
              nextMatrix[4] = nextMatrix[4]-moveBy;
            lightbox.transform.transformImage(next, nextMatrix);
          }
          if(prevMatrix){
            prevMatrix[4] = prevMatrix[4]-moveBy;
            lightbox.transform.transformImage(prev, prevMatrix);
          }
          if(Math.abs(matrix[4]) <= 0){
            clearInterval(moveInterval);
          }
        }, 15);
    }
    el.removeEventListener('mousemove', lightbox.events.get('translateMouseMove'));
    el.removeEventListener('touchmove', lightbox.events.get('translateTouchMove'));
    lightbox.events.remove('translateTouchMove');
    lightbox.events.remove('translateMouseMove');
  });
};

module.exports = imageHoldRelease;

},{}],19:[function(require,module,exports){

"use strict";
var imagePinch = function () {
  var lightbox = this;
  lightbox.events.add(function pinchListener(e){
    var
      img = e.target,
      zoomScale = (e.distance - e.initialPinch.distance)/250,
      cX = e.midPoint.x,
      cY = e.midPoint.y,
      oX = e.initialPinch.midPoint.x,
      oY = e.initialPinch.midPoint.y,
      matrix = lightbox.transform.getImageTransformMatrix(img, zoomScale, cX, cY),
      initialMatrix = lightbox.transform.getImageTransformMatrix(img, zoomScale, oX, oY);
    lightbox.transform.transformImage(img, matrix);
    lightbox.transform.translateImage(img, oX, oY, cX, cY, initialMatrix);
  });
};

module.exports = imagePinch;

},{}],20:[function(require,module,exports){

"use strict";
var imageScrollWheel = function () {
  var lightbox = this;
  lightbox.events.add(function scrollWheelListener(e){
    var img = e.target;
    var delta = e.deltaY,
      zoomScale = -0.05;
    if(delta < 0){
      zoomScale = zoomScale*-1;
    }
    var matrix = lightbox.transform.getImageTransformMatrix(img, zoomScale, e.offsetX, e.offsetY);
    lightbox.transform.transformImage(img, matrix);
  });
};

module.exports = imageScrollWheel;

},{}],21:[function(require,module,exports){

"use strict";
var imageSwipe = function () {
  var lightbox = this;
  lightbox.events.add(function swipeListener(e){
    var quadrant = Math.floor((e.direction.degrees/90)%4 +1),
      image = e.target,
      matrix = lightbox.transform.getElMatrix(image),
      scale = matrix[0],
      slideScaleX = e.distance.x,
      slideScaleY = e.distance.y,
      isMultipleTouch = (e.touches && e.touches.length > 1),
      threshold = 75;
    if(isMultipleTouch){
      return false;
    }
    if(scale > 1.5){
      if(e.distance.x > threshold && e.distance.y <= threshold){
        switch(quadrant) {
          case 1:
          case 4:
            lightbox.transform.smoothTranslate(image, 5, matrix[4]+slideScaleX, matrix[5], 2);
            break;
          case 2:
          case 3:
            lightbox.transform.smoothTranslate(image, 5, matrix[4]-slideScaleX, matrix[5], 2);
            break;
        }
      }
      if(e.distance.y > threshold && e.distance.x <= threshold){
        switch (quadrant) {
          case 1:
          case 2:
            lightbox.transform.smoothTranslate(image, 5, matrix[4], matrix[5]-slideScaleY, 4);
            break;
          case 3:
          case 4:
            lightbox.transform.smoothTranslate(image, 5, matrix[4], matrix[5]+slideScaleY, 4);
            break;
        }
      }
      if(e.distance.y > threshold && e.distance.x > threshold){
        switch(quadrant){
          case 1:
            //up & right
            lightbox.transform.smoothTranslate(image, 5, matrix[4]+slideScaleX, matrix[5]-slideScaleY, 4);
            break;
          case 2:
            //up & left
            lightbox.transform.smoothTranslate(image, 5, matrix[4]-slideScaleX, matrix[5]-slideScaleY, 4);
            break;
          case 3:
            //down & left
            lightbox.transform.smoothTranslate(image, 5, matrix[4]-slideScaleX, matrix[5]+slideScaleY, 4);
            break;
          case 4:
            //down & right
            lightbox.transform.smoothTranslate(image, 5, matrix[4]+slideScaleX, matrix[5]+slideScaleY, 4);
        }
      }
    }
  });
};

module.exports = imageSwipe;

},{}],22:[function(require,module,exports){
"use strict";
var stopTapProp = function () {
  this.events.add(function stopTapProp(e){
    e.stopPropagation();
  });
};
module.exports = stopTapProp;

},{}],23:[function(require,module,exports){

"use strict";
var thumbTap = function () {
  var lightbox = this;
  this.events.add(function thumbTap(e){
    e.stopPropagation();
    var img = this.getElementsByTagName('img')[0];
    lightbox.nav.enter(img);
  });
};
module.exports = thumbTap;

},{}],24:[function(require,module,exports){
/*globals touchme*/
"use strict";
require('./modules/polyfill-checks.js');
var lightbox = {
  util : require('./modules/util.js'),
  events : require('./modules/events.js'),
  imgCache: require('./modules/imgCache.js'),
  animate: require('./modules/animations.js'),
  transform: require('./modules/transform.js'),
  nav: require('./modules/nav.js'),
  bindEvents : require('./scripts/bindEvents'),
  controls : require('./modules/controls.js'),
  modal : require('./modules/lightboxModal'),
  init : function(thumbClass){
    if(typeof window.touchme === 'undefined'){
      throw new Error('Lightbox requires touchme.js as a dependency');
    }

    touchme({ holdThreshold: 50,
      swipeThreshold: 200,
      swipePrecision: 250,
      tapPrecision: 250,
      tapThreshold: 250,
      holdPrecision: 500});

    thumbClass = thumbClass || ".thumb";
    console.log(thumbClass);
    require('./modules/loadEvents.js')(this);
    this.controls = this.controls();
    var self = this;
    require('domready')(function(){
      document.addEventListener('touchend', function(e){
        e.preventDefault();
      });
      self.nav = self.nav(thumbClass);
      self.bindEvents(thumbClass);
    });
  },
  nodeAppended : null,
  openLightBox : function(node){
    var lightboxModal =  document.getElementById('lightbox-modal');
    lightboxModal.style.visibility = 'visible';
    document.body.style.overflow = 'hidden';
    this.nodeAppended = node;
    console.log(this.nodeAppended);
    lightboxModal.appendChild(this.nodeAppended);
  },
  closeLightBox : function(){
    var lightboxModal =  document.getElementById('lightbox-modal');
		

    lightboxModal.style.visibility = 'hidden';
    document.body.style.overflow = 'auto';
    lightboxModal.removeChild(this.nodeAppended);
    this.nodeAppended = null;
  }
};

window.lightbox = lightbox;



},{"./modules/animations.js":25,"./modules/controls.js":26,"./modules/events.js":27,"./modules/imgCache.js":28,"./modules/lightboxModal":29,"./modules/loadEvents.js":30,"./modules/nav.js":31,"./modules/polyfill-checks.js":32,"./modules/transform.js":33,"./modules/util.js":34,"./scripts/bindEvents":35,"domready":13}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
"use strict";
var controls = function(){
  var
      modal = document.createElement('div')
    , spinner = document.createElement('div')
    , spinnerCube1 = "<div class='cube1'></div>"
    , spinnerCube2 = "<div class='cube2'></div>"
    , controls = document.createElement('div')
    , controlsRemove = "<span class='glyphicon glyphicon-remove lightbox-controls-remove'></span>"
    , controlsLeft = "<span class='glyphicon glyphicon-chevron-left hidden-xs lightbox-controls-left'></span>"
    , controlsRight = "<span class='glyphicon glyphicon-chevron-right hidden-xs lightbox-controls-right'></span>";

  spinner.innerHTML = spinnerCube1+spinnerCube2;
  spinner.classList.add('spinner');

  controls.innerHTML = controlsRemove+controlsLeft+controlsRight;
  controls.classList.add('lightbox-controls');

  modal.appendChild(spinner);
  modal.appendChild(controls);
  modal.id = "lightbox-modal";
  document.body.insertBefore(modal, document.body.firstChild);
  return{
    left : document.getElementsByClassName('lightbox-controls-left')[0],
    right: document.getElementsByClassName('lightbox-controls-right')[0],
    remove: document.getElementsByClassName('lightbox-controls-remove')[0],
    modal: document.getElementById('lightbox-modal')
  };
};

module.exports = controls;


},{}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
"use strict";
var imgCache = function(){

  var hasCached = false,
      isComplete,
      processing = false,
      promise = new Promise(function(res){
        isComplete = res;
      });

  function loadImage(src){
    return new Promise(function(resolve, reject){
      var image = new Image();
      image.onload = function(){
        resolve(image);
      };
      image.onerror = function(){
        reject(image);
      };

      image.src = src;
    });
  }

  return {
    'cacheImages' : function(images){
      hasCached = false;
      processing = true;
      var pArray = [];

      for(var group in images){
        if(images.hasOwnProperty(group)){
          for(var idx in images[group]){
            if(images[group].hasOwnProperty(idx)){
              if(idx === 'last'){
                continue;
              }
              pArray.push( loadImage(images[group][idx]) );
            }
          }
        }
      }
      Promise.all(pArray).then(function(){
        //the images have been cached
        hasCached = true;
        processing = false;
      });
      return promise;
    },
    'complete' : function(){
      return promise;
    },
    'hasCached' : function(){
      return hasCached;
    },
    'processing' : function(){
      return processing;
    },
    'loadImage' : function(src){
      return loadImage(src);
    }
  };
};

module.exports = imgCache();

},{}],29:[function(require,module,exports){

"use strict";
var lightboxModal = function (needle, findType) {
  if(typeof findType === 'undefined'){
    findType = 'class';
  }
  var modal = document.getElementById('lightbox-modal');
  if(typeof needle === 'undefined'){
    return modal;
  }else{
    var term;
    switch(findType){
      case 'class':
            term = modal.getElementsByClassName(needle);
            break;
      case 'tag':
            term = modal.getElementsByTagName(needle);
            break;
      case 'id':
            term = modal.getElementById(needle);
            break;
      default :
            throw new Error('Unknown query type:', findType);
    }
    return term;
  }
};

module.exports = lightboxModal;

},{}],30:[function(require,module,exports){
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

},{"./../eventlisteners/disableDefault":15,"./../eventlisteners/imageDblTap":16,"./../eventlisteners/imageHold":17,"./../eventlisteners/imageHoldRelease":18,"./../eventlisteners/imagePinch":19,"./../eventlisteners/imageScrollWheel":20,"./../eventlisteners/imageSwipe":21,"./../eventlisteners/stopTapProp":22}],31:[function(require,module,exports){


"use strict";

var nav = function(thumbClass) {
  if(typeof this === 'undefined'){
    throw new Error("Navigation has no context, call after load");
  }
  var
      lightbox = this
    , thumbs = document.querySelectorAll(thumbClass+' img')
    , imageSet = {}
    , cache = lightbox.imgCache
    , lightboxModal = document.getElementById('lightbox-modal')
    , imageCycle = false
    , currentGroup;

  for(var i = 0; i<thumbs.length; i++){
    var image = thumbs[i];
    var idx = image.dataset.idx;
    var group = image.dataset.imagegroup;
    if(typeof imageSet[group] === "undefined"){
      imageSet[group] = { last:0};
    }
    imageSet[group][idx] = image.dataset.img;
    imageSet[group].last = (imageSet[group].last < idx) ? idx : imageSet[group].last;
  }
  var holdListener = lightbox.events.get('holdListener')
    , stopTapProp = lightbox.events.get('stopTapProp')
    , dbltapListener = lightbox.events.get('dbltapListener')
    , pinchListener = lightbox.events.get('pinchListener')
    , holdreleaseListener = lightbox.events.get('holdreleaseListener')
    , disableDefault = lightbox.events.get('disableDefault')
    , scrollWheelListener = lightbox.events.get('scrollWheelListener')
    , swipeListener = lightbox.events.get('swipeListener');


  //initialize cache complete function
  lightbox.imgCache.complete().then(function(){
    lightbox.modal('spinner')[0].style.visibility = 'hidden';
  });
  function disableDrag(el){
    el.addEventListener('dragstart', disableDefault);
    el.addEventListener('dragend', disableDefault);
    el.addEventListener('drag', disableDefault);
  }
  function disableTouch(el){
    el.addEventListener('touchstart', disableDefault);
    el.addEventListener('touchmove',disableDefault);
  }
  function enableTouch(el){
    el.removeEventListener('touchstart', disableDefault);
    el.removeEventListener('touchmove',disableDefault);
  }
  function lightboxEnter(img){
    var
        idx = img.dataset.idx
      , group = img.dataset.imagegroup
      , src = imageSet[group][idx];
    currentGroup = group;
    lightbox.imgCache.loadImage(src).then(function(image){
      addImage(idx, image);
      if(!lightbox.imgCache.hasCached() && !lightbox.imgCache.processing()){
        lightbox.imgCache.cacheImages(imageSet);
      }
    });
    lightboxModal.style.visibility = 'visible';
    document.body.style.overflow = 'hidden';
  }

  function lightboxExit(e){
    //e.stopPropagation();
    console.log(e.target, e.currentTarget);
    if(e.target !== e.currentTarget){
      return false;
    }
    var images = lightboxModal.getElementsByTagName('img');
    images  = Array.prototype.slice.call( images );

    for(var i = 0; i < images.length; i++){
      if(typeof images[i] !== 'undefined'){
        removeTouchListeners(images[i]);
        removeImage(images[i]);
      }
    }
    imageCycle = false;
    enableTouch(document);
    lightboxModal.style.visibility = 'hidden';
    document.body.style.overflow = 'auto';

  }

  function addTouchListeners(el){
    disableDrag(el);
    disableTouch(document);
    el.addEventListener('tap', stopTapProp);
    el.addEventListener('dbltap', dbltapListener);
    el.addEventListener('hold', holdListener);
    el.addEventListener('pinch', pinchListener);
    el.addEventListener('holdrelease', holdreleaseListener);
    el.addEventListener('wheel', scrollWheelListener);
    //el.addEventListener('DOMMouseScroll', scrollWheelListener);
    el.addEventListener('swipe', swipeListener);
  }
  function removeTouchListeners(el){
    el.removeEventListener('hold', holdListener);
    el.removeEventListener('pinch', pinchListener);
    el.removeEventListener('holdrelease', holdreleaseListener);
    el.removeEventListener('wheel', scrollWheelListener);
    //el.addEventListener('DOMMouseScroll', scrollWheelListener);

  }
  function currentImage(){
    return lightboxModal.getElementsByClassName('current')[0];
  }
  function loadImageCycle(){
    var
        nextImage = getImage('next')
      , prevImage = getImage('prev');
    imageCycle = true;
    cache.loadImage(nextImage.image).then(function(image){
      addImage(nextImage.idx, image, 'next');
    });
    cache.loadImage(prevImage.image).then(function(image){
      addImage(prevImage.idx, image, 'prev');
    });

  }
  function hideImageCycle(){
    imageCycle = false;
    var images = [].slice.call(lightboxModal.getElementsByTagName('img'));
    images.forEach(function(image){
      if(image.classList.contains('current')){
        return;
      }
      removeImage(image);
    });
  }
  function reloadImageCycle(){
    hideImageCycle();
    loadImageCycle();
  }
  function addImage(idx, image, position){
    if(typeof position === "undefined"){
      position = 'current';
    }
    image.classList.add(position);
    lightboxModal.appendChild(image);
    if(position === 'current'){
      lightboxModal.dataset.idx = idx;
      addTouchListeners(image);
      reloadImageCycle();
    }
    var DOMImage =  lightboxModal.getElementsByTagName('img')[0];
    DOMImage.classList.remove('hidden');
  }
  function removeImage(image){
    lightboxModal.removeChild(image);
  }
  function getImage(position){
    var
      idx = parseInt(lightboxModal.dataset.idx, 10),
      newIdx,nextImg,prevImg,
      returnObj = {};
    switch(position){
      case 'next':
        nextImg = imageSet[currentGroup][idx+1];
        newIdx = idx+1;
        if(typeof nextImg === 'undefined'){
          nextImg = imageSet[currentGroup][1];
          newIdx=1;
        }
        returnObj = {
          image : nextImg,
          idx : newIdx
        };
            break;
      case 'prev':
      case 'previous':
        prevImg = imageSet[currentGroup][idx-1];
        newIdx = idx-1;
        if(typeof prevImg === 'undefined'){
          prevImg = imageSet[currentGroup][imageSet[currentGroup].last];
          newIdx = imageSet[currentGroup].last;
        }
        returnObj = {
          image : prevImg,
          idx : newIdx
        };
            break;
      default :
            throw new Error('position must be \'next\' \'prev\' or \'previous\'');
    }

    return returnObj;
  }
  function nextImage(e){
    if(typeof e !== 'undefined'){
     // e.stopPropagation();
    }
    var
        next = getImage('next')
      , curImg = lightboxModal.getElementsByClassName('current')[0]
      , nextImg = next.image
      , newIdx = next.idx;

    cache.loadImage(nextImg).then(function(image){
      var next = image;
      lightbox.animate(curImg).slideLeft().start().then(function(){
        removeImage(curImg);
        if(!imageCycle){
          addImage(newIdx, next);
        }
      });
      if(imageCycle){
        removeImage(lightbox.modal('prev')[0]);
        var nextImage = lightbox.modal('next')[0];
        lightbox.animate(nextImage).center().start().then(function(){
          addImage(newIdx, next);
        });
      }
    });
  }
  function prevImage(e){
    if(typeof e !== 'undefined'){
      //e.stopPropagation();
    }
    var
        prev = getImage('prev')
      , curImg = lightboxModal.getElementsByClassName('current')[0]
      , newIdx = prev.idx;

    cache.loadImage(prev.image).then(function(image){
      var prev = image;
      lightbox.animate(curImg).slideRight().start().then(function(){
        removeImage(curImg);
        if(!imageCycle){
          addImage(newIdx, prev);
        }
      });
      if(imageCycle){
        removeImage(lightbox.modal('next')[0]);
        var previousImage = lightbox.modal('prev')[0];
        lightbox.animate(previousImage).center().start().then(function(){
          addImage(newIdx, prev);
        });
      }
    });
  }
  return {
    addImage: addImage,
    removeImage: removeImage,
    getImage: function(position){
      return getImage(position);
    },
    addTouchListeners : function(image){
      addTouchListeners(image);
    },
    removeTouchListeners : function(image){
      removeTouchListeners(image);
    },
    next : nextImage,
    prev : prevImage,
    exit : lightboxExit,
    enter : lightboxEnter,
    imageSet : function(){
      return imageSet;
    },
    currentImage : currentImage,
    imageCycle : function(){
      return imageCycle;
    },
    loadImageCycle : loadImageCycle,
    hideImageCycle : hideImageCycle
  };
};

module.exports = nav;

},{}],32:[function(require,module,exports){
/*globals Modernizr*/
/*
The lightbox relies on serveral features that might not be widely supported.
So let's try and make is flexible
 */
"use strict";

module.exports = (function(){
  require('browsernizr/test/dom/classlist.js');
  require('browsernizr/test/es6/promises.js');

  window.Modernizr = require('browsernizr');

  if(Modernizr.classlist === false){
    require('classlist-polyfill');
  }

  if(Modernizr.promise === false){
    window.Promise = require('es6-promise').Promise;
  }

})();

},{"browsernizr":1,"browsernizr/test/dom/classlist.js":11,"browsernizr/test/es6/promises.js":12,"classlist-polyfill":"classList","es6-promise":"promise"}],33:[function(require,module,exports){
"use strict";

var transform = {
  maxZoom : 3,
  minZoom : 1
};
transform.prefix = (function () {
  var testEl = document.createElement('div');
  if(testEl.style.transform === null || testEl.style.transform === undefined) {
    var vendors = ['Webkit', 'Moz', 'ms'];
    for(var vendor in vendors) {
      if(testEl.style[ vendors[vendor] + 'Transform' ] !== undefined) {
        return vendors[vendor] + 'Transform';
      }
    }
  }
  return 'transform';
})();
console.log(transform.prefix);

transform.round = function(val, decimals){
  return Number( Math.round(val+'e'+decimals)+'e-'+decimals );
};
transform.matrixArray = function(matrix){
  matrix = matrix.split("(")[1];
  matrix = matrix.split(")")[0];
  matrix = matrix.split(',');
  matrix = matrix.map(parseFloat);
  return matrix;
};
transform.getElMatrix = function(el){
  if(window.getComputedStyle(el).transform === 'none'){
    el.style[this.prefix] = "scale(1,1)";
  }
  return this.matrixArray(window.getComputedStyle(el).transform);
};
transform.getXScale = function(img){
  return this.round(this.getElMatrix(img)[0], 2);

};
transform.transformImage = function(img, matrix){
  img.style[this.prefix] = "matrix("+matrix.join()+")";
};
transform.getComputedRect = function(el){
  var
      width = parseInt(window.getComputedStyle(el).width.split('px')[0], 10)
    , height = parseInt(window.getComputedStyle(el).height.split('px')[0], 10);

  return {
    width:width,
    height:height
  };
};

transform.getCalcDistance = function(zoomScale, clientX, clientY, img){
  var
      rect = img.getBoundingClientRect()
    , cX = (rect.width/2)+rect.left
    , cY = (rect.height/2)+rect.top
    , xFromCenter = Math.abs(clientX - cX)
    , yFromCenter = Math.abs(clientY - cY)
    , distance = Math.sqrt( (yFromCenter*yFromCenter) + (xFromCenter*xFromCenter) );

  return distance*zoomScale;
};

transform.cloneZoom = function (img, matrix, newX, newY){
  var clone = img.cloneNode(true),
      newMatrix = matrix.slice(0);

  newMatrix[4] = newMatrix[4]+newX;
  newMatrix[5] = newMatrix[5]+newY;
  clone.classList.add('clone-hidden');
  this.transformImage(clone, newMatrix);

  return clone;
};
transform.zoomBounds = function(img, matrix, xDist, yDist){

  var clone = this.cloneZoom(img, matrix, xDist, yDist);
  img.parentNode.appendChild(clone);
  var rect = clone.getBoundingClientRect(),
      newX, newY,
      oldX = matrix[4], oldY = matrix[5],
      bottom = window.innerHeight-rect.bottom,
      right = window.innerWidth-rect.right;
  if(rect.height > window.innerHeight){
    if(rect.top > 0){
      newY = oldY+(yDist-rect.top);
    }else if(bottom > 0){
      newY = oldY+(yDist+bottom);
    }else{
      newY = oldY+yDist;
    }
  }else{
    newY = 0;
  }
  if(rect.width > window.innerWidth){
    if(rect.left > 0){
      newX = oldX+(xDist-rect.left);
    }else if (right > 0){
      newX = oldX+(xDist+right);
    }else{
      newX = oldX+xDist;
    }
  }else{
    newX = 0;
  }

  img.parentNode.removeChild(clone);
  return{
    x: newX,
    y: newY
  };
};
transform.getMinZoom = function(img){
  var imgRect = img.getBoundingClientRect(),
      max = Math.max(imgRect.width, imgRect.height),
      scalePoint,
      nextClick = 0.25;

  if(max === imgRect.height){
    scalePoint = window.innerHeight / max;
  }else if(max === imgRect.width){
    scalePoint = window.innerWidth / max;
  }

  return this.round(scalePoint+nextClick, 2);
};
transform.getFocusPoint = function(clientX, clientY, img, zoomScale){
  if(typeof zoomScale === 'undefined'){
    zoomScale = 0;
  }
  var
    rect = img.getBoundingClientRect(),
    calcScale = (zoomScale >= 0) ? zoomScale+1 : zoomScale - 1,
    imgCX = (rect.width*calcScale)/2,
    imgCY = (rect.height*calcScale)/2;
  return {
    'x' : clientX,
    'y' : clientY,
    'cX': imgCX+rect.left,
    'cY': imgCY+rect.top
  };
};
transform.getNewFocusPoint = function(zoomScale, clientX, clientY, img){
  var
      focusPoint = this.getFocusPoint(clientX, clientY, img)
    , xFromCenter = focusPoint.x - focusPoint.cX
    , yFromCenter = focusPoint.y - focusPoint.cY
    , dist = Math.sqrt( Math.pow(xFromCenter, 2) + Math.pow(yFromCenter, 2))
    , calcDistance = dist*zoomScale
    , angle = Math.atan2((yFromCenter), xFromCenter)
    , move = calcDistance;
  var
      newX = focusPoint.x + (Math.cos(angle) * move)
    , newY = focusPoint.y + (Math.sin(angle) * move);

  return {
    x : newX,
    y : newY,
    distanceX : clientX-newX,
    distanceY : clientY-newY
  };
};
transform.getImageTransformMatrix = function(img, zoomScale, clientX, clientY){
  var transformStyle = window.getComputedStyle(img)[this.prefix];
  if(transformStyle === 'none' || !transformStyle || transformStyle === null){
    img.style[this.prefix] = "scale(1,1)";
    transformStyle = window.getComputedStyle(img)[this.prefix];
  }
  var
    matrix = this.matrixArray(transformStyle),
    newPoint = this.getNewFocusPoint(zoomScale, clientX, clientY, img);
  if(  ((matrix[0] + zoomScale) <= this.maxZoom )
    && ((matrix[0] + zoomScale) >= this.minZoom )){
    matrix[0] = matrix[0] + zoomScale;
    matrix[3] = matrix[3]  + zoomScale;
    var panDistance = this.zoomBounds(img, matrix, newPoint.distanceX, newPoint.distanceY);
    matrix[4] = panDistance.x;
    matrix[5] = panDistance.y;
  }else if(matrix[0]+zoomScale >= this.maxZoom){
    matrix[0] = this.maxZoom;
    matrix[3] = this.maxZoom;
  }else if(matrix[0]+ zoomScale <=this.minZoom){
    matrix[0] = this.minZoom;
    matrix[3] = this.minZoom;
  }

  return matrix;
};
transform.yAxisBounds = function(image, y, distance, curY){
  var box = image.getBoundingClientRect(),
      wHeight = window.innerHeight;

  if(box.height <= wHeight){
    return y;
  }
  if( curY+(wHeight-box.bottom) > (y+distance) ){
    return curY;
  }
  if(curY-box.top < (y+distance) ){
    return curY;
  }

  return y+distance;
};
transform.translateImage = function(el, oX, oY, nX, nY, initialMatrix){
  var
    image = el,
    distanceScale = 0.75,
    xDistance = (nX - oX)*distanceScale,
    yDistance = (nY - oY)*distanceScale,
    matrix = this.getElMatrix(el);
  matrix[4] =  initialMatrix[4] + xDistance;
  matrix[5] = this.yAxisBounds(image, initialMatrix[5], yDistance, matrix[5]);
  this.transformImage(image, matrix);
};
transform.smoothTranslate = function(el, ms, x, y, precision){
  var matrix = this.getElMatrix(el),
      dX = x - matrix[4],
      dY = y - matrix[5],
      angle = Math.atan2(dY, dX),
      velocity = 15,
      xApproach = false,
      yApproach = false,
      self = this,
      moveInterval = setInterval(function(){
        if(  matrix[4] >= (x-precision)
          && matrix[4] <= (x+precision)){
          xApproach = true;
        }else if(
          el.getBoundingClientRect().right <= window.innerWidth
        ||el.getBoundingClientRect().left >= 0 ){
          xApproach = true;
        }else{
          matrix[4] += Math.cos(angle) * velocity;
        }
        if(  matrix[5] >= (y-precision)
          && matrix[5] <= (y+precision)){
          yApproach = true;
        }else if(
           el.getBoundingClientRect().bottom <= window.innerHeight
        || el.getBoundingClientRect().top >= 0
        ){
          yApproach = true;
        }else{
          matrix[5] += Math.sin(angle) * velocity;
        }
        self.transformImage(el, matrix);
        if(xApproach && yApproach){
          clearInterval(moveInterval);
        }
      }, ms);
};
module.exports = transform;

},{}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
"use strict";
var bindEvents = function (thumbClass) {
  if(this === 'undefined'){
    throw new Error();
  }
  require('./../eventlisteners/thumbTap').call(this);
  var
      lightbox = this
    , thumbTap = lightbox.events.get('thumbTap');

  lightbox.util(thumbClass).addEvents('tap', thumbTap);

  lightbox.controls.left.addEventListener('tap', lightbox.nav.prev);
  lightbox.controls.right.addEventListener('tap', lightbox.nav.next);
  lightbox.controls.remove.addEventListener('tap', lightbox.nav.exit);
  lightbox.controls.modal.addEventListener('tap', lightbox.nav.exit);
};

module.exports = bindEvents;

},{"./../eventlisteners/thumbTap":23}],"classList":[function(require,module,exports){
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-07-23
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

/* Copied from MDN:
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 */

if ("document" in window.self) {

  // Full polyfill for browsers with no classList support
  if (!("classList" in document.createElement("_"))) {

  (function (view) {

    "use strict";

    if (!('Element' in view)) return;

    var
        classListProp = "classList"
      , protoProp = "prototype"
      , elemCtrProto = view.Element[protoProp]
      , objCtr = Object
      , strTrim = String[protoProp].trim || function () {
        return this.replace(/^\s+|\s+$/g, "");
      }
      , arrIndexOf = Array[protoProp].indexOf || function (item) {
        var
            i = 0
          , len = this.length
        ;
        for (; i < len; i++) {
          if (i in this && this[i] === item) {
            return i;
          }
        }
        return -1;
      }
      // Vendors: please allow content code to instantiate DOMExceptions
      , DOMEx = function (type, message) {
        this.name = type;
        this.code = DOMException[type];
        this.message = message;
      }
      , checkTokenAndGetIndex = function (classList, token) {
        if (token === "") {
          throw new DOMEx(
              "SYNTAX_ERR"
            , "An invalid or illegal string was specified"
          );
        }
        if (/\s/.test(token)) {
          throw new DOMEx(
              "INVALID_CHARACTER_ERR"
            , "String contains an invalid character"
          );
        }
        return arrIndexOf.call(classList, token);
      }
      , ClassList = function (elem) {
        var
            trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
          , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
          , i = 0
          , len = classes.length
        ;
        for (; i < len; i++) {
          this.push(classes[i]);
        }
        this._updateClassName = function () {
          elem.setAttribute("class", this.toString());
        };
      }
      , classListProto = ClassList[protoProp] = []
      , classListGetter = function () {
        return new ClassList(this);
      }
    ;
    // Most DOMException implementations don't allow calling DOMException's toString()
    // on non-DOMExceptions. Error's toString() is sufficient here.
    DOMEx[protoProp] = Error[protoProp];
    classListProto.item = function (i) {
      return this[i] || null;
    };
    classListProto.contains = function (token) {
      token += "";
      return checkTokenAndGetIndex(this, token) !== -1;
    };
    classListProto.add = function () {
      var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
      ;
      do {
        token = tokens[i] + "";
        if (checkTokenAndGetIndex(this, token) === -1) {
          this.push(token);
          updated = true;
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.remove = function () {
      var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
        , index
      ;
      do {
        token = tokens[i] + "";
        index = checkTokenAndGetIndex(this, token);
        while (index !== -1) {
          this.splice(index, 1);
          updated = true;
          index = checkTokenAndGetIndex(this, token);
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.toggle = function (token, force) {
      token += "";

      var
          result = this.contains(token)
        , method = result ?
          force !== true && "remove"
        :
          force !== false && "add"
      ;

      if (method) {
        this[method](token);
      }

      if (force === true || force === false) {
        return force;
      } else {
        return !result;
      }
    };
    classListProto.toString = function () {
      return this.join(" ");
    };

    if (objCtr.defineProperty) {
      var classListPropDesc = {
          get: classListGetter
        , enumerable: true
        , configurable: true
      };
      try {
        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
      } catch (ex) { // IE 8 doesn't support enumerable:true
        if (ex.number === -0x7FF5EC54) {
          classListPropDesc.enumerable = false;
          objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        }
      }
    } else if (objCtr[protoProp].__defineGetter__) {
      elemCtrProto.__defineGetter__(classListProp, classListGetter);
    }

    }(window.self));

    } else {
    // There is full or partial native classList support, so just check if we need
    // to normalize the add/remove and toggle APIs.

    (function () {
      "use strict";

      var testElement = document.createElement("_");

      testElement.classList.add("c1", "c2");

      // Polyfill for IE 10/11 and Firefox <26, where classList.add and
      // classList.remove exist but support only one argument at a time.
      if (!testElement.classList.contains("c2")) {
        var createMethod = function(method) {
          var original = DOMTokenList.prototype[method];

          DOMTokenList.prototype[method] = function(token) {
            var i, len = arguments.length;

            for (i = 0; i < len; i++) {
              token = arguments[i];
              original.call(this, token);
            }
          };
        };
        createMethod('add');
        createMethod('remove');
      }

      testElement.classList.toggle("c3", false);

      // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
      // support the second argument.
      if (testElement.classList.contains("c3")) {
        var _toggle = DOMTokenList.prototype.toggle;

        DOMTokenList.prototype.toggle = function(token, force) {
          if (1 in arguments && !this.contains(token) === !force) {
            return force;
          } else {
            return _toggle.call(this, token);
          }
        };

      }

      testElement = null;
    }());
  }
}

},{}],"promise":[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   3.0.2
 */

(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
      lib$es6$promise$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$toString = {}.toString;
    var lib$es6$promise$asap$$vertxNext;
    var lib$es6$promise$asap$$customSchedulerFn;

    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
      lib$es6$promise$asap$$len += 2;
      if (lib$es6$promise$asap$$len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (lib$es6$promise$asap$$customSchedulerFn) {
          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
        } else {
          lib$es6$promise$asap$$scheduleFlush();
        }
      }
    }

    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
    }

    function lib$es6$promise$asap$$setAsap(asapFn) {
      lib$es6$promise$asap$$asap = asapFn;
    }

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // see https://github.com/cujojs/when/issues/410 for details
      return function() {
        process.nextTick(lib$es6$promise$asap$$flush);
      };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
      return function() {
        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
      };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$es6$promise$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$es6$promise$asap$$flush, 1);
      };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
        var callback = lib$es6$promise$asap$$queue[i];
        var arg = lib$es6$promise$asap$$queue[i+1];

        callback(arg);

        lib$es6$promise$asap$$queue[i] = undefined;
        lib$es6$promise$asap$$queue[i+1] = undefined;
      }

      lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertx() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$es6$promise$asap$$useVertxTimer();
      } catch(e) {
        return lib$es6$promise$asap$$useSetTimeout();
      }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
    } else {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFulfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
        return lib$es6$promise$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
       lib$es6$promise$asap$$asap(function(promise) {
        var sealed = false;
        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$es6$promise$$internal$$resolve(promise, value);
          } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$es6$promise$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$es6$promise$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, thenable._result);
      } else {
        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = lib$es6$promise$$internal$$getThen(maybeThenable);

        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$es6$promise$utils$$isFunction(then)) {
          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
        lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
      } else {
        lib$es6$promise$$internal$$fulfill(promise, value);
      }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$es6$promise$$internal$$FULFILLED;

      if (promise._subscribers.length !== 0) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
      }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
      promise._state = lib$es6$promise$$internal$$REJECTED;
      promise._result = reason;

      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
      }
    }

    function lib$es6$promise$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$es6$promise$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$es6$promise$$internal$$reject(promise, error);
      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, value);
      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$es6$promise$$internal$$reject(promise, e);
      }
    }

    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
      var enumerator = this;

      enumerator._instanceConstructor = Constructor;
      enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (enumerator._validateInput(input)) {
        enumerator._input     = input;
        enumerator.length     = input.length;
        enumerator._remaining = input.length;

        enumerator._init();

        if (enumerator.length === 0) {
          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
        } else {
          enumerator.length = enumerator.length || 0;
          enumerator._enumerate();
          if (enumerator._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
          }
        }
      } else {
        lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
      }
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return lib$es6$promise$utils$$isArray(input);
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
      var enumerator = this;

      var length  = enumerator.length;
      var promise = enumerator.promise;
      var input   = enumerator._input;

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        enumerator._eachEntry(input[i], i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var enumerator = this;
      var c = enumerator._instanceConstructor;

      if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
          entry._onerror = null;
          enumerator._settledAt(entry._state, i, entry._result);
        } else {
          enumerator._willSettleAt(c.resolve(entry), i);
        }
      } else {
        enumerator._remaining--;
        enumerator._result[i] = entry;
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var enumerator = this;
      var promise = enumerator.promise;

      if (promise._state === lib$es6$promise$$internal$$PENDING) {
        enumerator._remaining--;

        if (state === lib$es6$promise$$internal$$REJECTED) {
          lib$es6$promise$$internal$$reject(promise, value);
        } else {
          enumerator._result[i] = value;
        }
      }

      if (enumerator._remaining === 0) {
        lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
      });
    };
    function lib$es6$promise$promise$all$$all(entries) {
      return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (!lib$es6$promise$utils$$isArray(entries)) {
        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$resolve$$resolve(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
    function lib$es6$promise$promise$reject$$reject(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

    var lib$es6$promise$promise$$counter = 0;

    function lib$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
      this._id = lib$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if (lib$es6$promise$$internal$$noop !== resolver) {
        if (!lib$es6$promise$utils$$isFunction(resolver)) {
          lib$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof lib$es6$promise$promise$$Promise)) {
          lib$es6$promise$promise$$needsNew();
        }

        lib$es6$promise$$internal$$initializePromise(this, resolver);
      }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

    lib$es6$promise$promise$$Promise.prototype = {
      constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection) {
        var parent = this;
        var state = parent._state;

        if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
          return this;
        }

        var child = new this.constructor(lib$es6$promise$$internal$$noop);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          lib$es6$promise$asap$$asap(function(){
            lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    function lib$es6$promise$polyfill$$polyfill() {
      var local;

      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }

      var P = local.Promise;

      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
      }

      local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
      'Promise': lib$es6$promise$promise$$default,
      'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":14}]},{},[24]);
