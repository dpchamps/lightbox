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
  }
};

module.exports = controls;

