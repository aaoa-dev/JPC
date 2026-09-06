(function(){
  "use strict";
  var $=JPC.$;
  var modeTakeHome=$("modeTakeHome"),modeEarn=$("modeEarn");
  var panelTakeHome=$("panelTakeHome"),panelEarn=$("panelEarn");
  var kickerJp=$("pageKickerJp"),pageH1=$("pageH1"),pageLede=$("pageLede");

  var COPY={
    takehome:{
      title:"Japan Take-Home & Savings Calculator",
      kicker:"家計簿",
      h1:'Take-home &amp; <em>savings</em>',
      lede:"What a salary in Japan leaves you after tax, insurance and living costs, and how much of it you could keep."
    },
    earn:{
      title:"Japan · How Much to Earn",
      kicker:"逆算",
      h1:'How much to <em>earn</em>',
      lede:"Name the take-home you want. This works backwards through Japan’s tax, insurance and pension to the gross salary it takes to get there."
    }
  };

  function setMode(mode){
    var isTakeHome=mode==="takehome";
    modeTakeHome.setAttribute("aria-pressed",isTakeHome);
    modeEarn.setAttribute("aria-pressed",!isTakeHome);
    panelTakeHome.hidden=!isTakeHome;
    panelEarn.hidden=isTakeHome;
    var c=COPY[mode];
    document.title=c.title;
    kickerJp.textContent=c.kicker;
    pageH1.innerHTML=c.h1;
    pageLede.textContent=c.lede;
  }
  modeTakeHome.addEventListener("click",function(){setMode("takehome");});
  modeEarn.addEventListener("click",function(){setMode("earn");});
})();
