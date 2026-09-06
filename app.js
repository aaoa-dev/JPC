(function(){
  "use strict";
  var $=JPC.$;
  var modeTakeHome=$("modeTakeHome"),modeEarn=$("modeEarn");
  var panelTakeHome=$("panelTakeHome"),panelEarn=$("panelEarn");
  var TITLES={takehome:"Japan Take-Home & Savings Calculator",earn:"Japan · How Much to Earn"};

  function setMode(mode){
    var isTakeHome=mode==="takehome";
    modeTakeHome.setAttribute("aria-pressed",isTakeHome);
    modeEarn.setAttribute("aria-pressed",!isTakeHome);
    panelTakeHome.hidden=!isTakeHome;
    panelEarn.hidden=isTakeHome;
    document.title=isTakeHome?TITLES.takehome:TITLES.earn;
  }
  modeTakeHome.addEventListener("click",function(){setMode("takehome");});
  modeEarn.addEventListener("click",function(){setMode("earn");});
})();
