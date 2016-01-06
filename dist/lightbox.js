(function(root, undefined) {

  "use strict";


/* lightbox main */

// Base function.
var lightbox = function() {
  // Add functionality here.
  console.log("HELLO");
  return true;
};


// Version.
lightbox.VERSION = '0.0.0';


// Export to the root, which is probably `window`.
root.lightbox = lightbox;


}(this));
