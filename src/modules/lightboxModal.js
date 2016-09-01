
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
